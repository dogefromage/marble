import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAddNode } from '../slices/geometriesSlice';
import { geometryEditorPanelsCloseTemplateCatalog } from '../slices/panelGeometryEditorSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { NODE_WIDTH } from '../styles/GeometryNodeDiv';
import { decomposeTemplateId, GeometryEditorPanelState, GNodeTemplate, GNodeTemplateCategories, MenuElement, SearchMenuElement, templateCategoryNames, TitleMenuElement, VerticalMenuShape } from '../types';
import MenuRoot from './MenuRoot';

type GroupedTemplatesMap = {
    [C in GNodeTemplateCategories]: GNodeTemplate[];
}

interface Props {
    panelId: string;
    geometryId: string;
    templateCatalog: NonNullable<GeometryEditorPanelState['templateCatalog']>;
}

const GeometryTemplateCatalog = ({ panelId, geometryId, templateCatalog }: Props) => {
    const dispatch = useAppDispatch();
    const { templates } = useAppSelector(selectTemplates);
    const [ searchValue, setSearchValue ] = useState('');

    const addNode = (template: GNodeTemplate) => {
        dispatch(geometriesAddNode({
            geometryId,
            templateId: template.id,
            position: {
                x: templateCatalog.worldPosition.x - 0.5 * NODE_WIDTH,
                y: templateCatalog.worldPosition.y, 
            },
            undo: {}
        }));
    }

    const menuShape = useMemo(() => {

        const allTemplates = (Object.values(templates) as GNodeTemplate[])
            .filter(template => {
            const { id, type } = decomposeTemplateId(template.id);

            const isForeignOutput = type === 'output' && id !== geometryId;
            const isCurrentComposedTemplate = type === 'composite' && id === geometryId;

            return !isForeignOutput && !isCurrentComposedTemplate;
        });

        const title: TitleMenuElement = {
            type: 'title',
            key: 'title',
            name: 'Add Template',
        }
        const searchBar: SearchMenuElement = {
            type: 'search',
            key: 'search',
            name: 'search',
            placeholder: 'Search...',
            autofocus: true,
        };

        if (searchValue.length > 0) {
            // render filtered
            const filtered = allTemplates
                .filter(t => t!.rows[0].name.toLowerCase().includes(searchValue.toLowerCase()));

            const listTemplates: MenuElement[] = filtered.map(template => ({
                type: 'button',
                key: template!.id,
                name: template!.rows[0].name,
                onClick: () => addNode(template!),
            }));
            
            const menuShape: VerticalMenuShape = {
                type: 'vertical',
                list: [
                    title,
                    searchBar,
                    ...listTemplates,
                ],
            }
            return menuShape;
        }
        else {
            // render grouped
            const groupedTemplatesMap = allTemplates
                .reduce((groupes, current) =>
                {
                    const key = current!.category;
                    if (groupes[key] == null) { groupes[key] = []; }
                    groupes[key].push(current!);
                    return groupes;
                }, {} as GroupedTemplatesMap);
            
            const sortedGroupes = Object.entries(groupedTemplatesMap)
                .sort((group1, group2) => {
                    const cat1 = group1[0].toLowerCase();
                    const cat2 = group2[0].toLowerCase();
                    if (cat1 === cat2) return 0;
                    return cat1 > cat2 ? 1 : -1;
                });

            const groupedList: MenuElement[] = sortedGroupes.map(([ category, tempOfGroup ]) => ({
                type: 'expand',
                key: category,
                name: templateCategoryNames[category as GNodeTemplateCategories],
                sublist: {
                    type: 'vertical',
                    list: tempOfGroup.map(template => ({
                        type: 'button',
                        key: template.id,
                        name: template.rows[0].name,
                        onClick: () => addNode(template),
                    }))
                } 
            }));
            
            const menuShape: VerticalMenuShape = {
                type: 'vertical',
                list: [
                    title,
                    searchBar,
                    ...groupedList,
                ],
            }
            return menuShape;
        }
    }, [ templates, searchValue ]);

    useEffect(() => {
        setSearchValue('');
    }, [ templateCatalog ]);
    
    return (
        <MenuRoot
            type={'misc'}
            shape={menuShape}
            onClose={() => {
                dispatch(geometryEditorPanelsCloseTemplateCatalog({ panelId }))
            }}
            anchor={templateCatalog.offsetPosition}
            onSearchUpdated={setSearchValue}
            center={templateCatalog.center}
        />
    );
}

export default GeometryTemplateCatalog;