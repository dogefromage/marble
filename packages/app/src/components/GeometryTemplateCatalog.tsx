import React, { useEffect, useMemo, useState } from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAddNode } from '../slices/geometriesSlice';
import { geometryEditorPanelsCloseTemplateCatalog } from '../slices/panelGeometryEditorSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { NODE_WIDTH } from '../styles/GeometryNodeDiv';
import { GNodeT, GNodeTemplateCategories, MenuElement, MenuTypes, SearchMenuElement, TEMPLATE_CATEGORY_NAMES, TitleMenuElement, VerticalMenuShape, ViewTypes } from '../types';
import MenuRoot from './MenuRoot';

type GroupedTemplatesMap = {
    [C in GNodeTemplateCategories]: GNodeT[];
}

interface Props
{
    panelId: string;
}

const GeometryTemplateCatalog = ({ panelId }: Props) =>
{
    const dispatch = useAppDispatch();
    const { templates } = useAppSelector(selectTemplates);
    const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));
    
    const [ searchValue, setSearchValue ] = useState('');

    const addNode = (template: GNodeT) =>
    {
        if (!panelState?.geometryId || 
            !panelState?.templateCatalog) return;

        dispatch(geometriesAddNode({
            geometryId: panelState.geometryId,
            templateId: template.id,
            position: {
                x: panelState.templateCatalog.worldPosition.x - 0.5 * NODE_WIDTH,
                y: panelState.templateCatalog.worldPosition.y, 
            },
            undo: {}
        }));
    }

    const menuShape = useMemo(() => {
        const allTemplates = Object.values(templates);

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
                name: TEMPLATE_CATEGORY_NAMES[category as GNodeTemplateCategories],
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

    useEffect(() =>
    {
        setSearchValue('');
    }, [ panelState?.templateCatalog ]);

    if (!panelState?.templateCatalog) return null;
    
    return (
        <MenuRoot
            type={MenuTypes.Misc}
            shape={menuShape}
            onClose={() => {
                dispatch(geometryEditorPanelsCloseTemplateCatalog({ panelId }))
            }}
            anchor={panelState.templateCatalog.offsetPosition}
            onSearchUpdated={setSearchValue}
            center={panelState.templateCatalog.center}
        />
    );
}

export default GeometryTemplateCatalog;