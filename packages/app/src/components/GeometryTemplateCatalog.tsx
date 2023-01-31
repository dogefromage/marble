import React, { useEffect, useMemo, useState } from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAddNode } from '../slices/geometriesSlice';
import { geometryEditorPanelsCloseTemplateCatalog } from '../slices/panelGeometryEditorSlice';
import { selectPanelClientRect, selectPanelManager } from '../slices/panelManagerSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { NODE_WIDTH } from '../styles/GeometryNodeDiv';
import { decomposeTemplateId, FloatingMenuShape, GNodeTemplate, GNodeTemplateCategories, MenuElement, SearchMenuElement, templateCategoryNames, TitleMenuElement, ViewTypes } from '../types';
import { offsetToClientPos } from '../utils/panelManager';
import MenuRoot from './MenuRoot';

type GroupedTemplatesMap = {
    [C in GNodeTemplateCategories]: GNodeTemplate[];
}

interface Props {
    panelId: string;
    geometryId: string;
}

const GeometryTemplateCatalog = ({ panelId, geometryId }: Props) => {
    const dispatch = useAppDispatch();
    const { templates } = useAppSelector(selectTemplates);
    const [ searchValue, setSearchValue ] = useState('');

    const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));
    const currentPanelRect = useAppSelector(selectPanelClientRect(panelId));
    const templateCatalog = panelState?.templateCatalog;

    const addNode = (template: GNodeTemplate) => {
        if (!templateCatalog) return;
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
            
            const menuShape: FloatingMenuShape = {
                type: 'floating',
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
                .sort(([ a ], [ b ]) => a.localeCompare(b));

            const groupedList: MenuElement[] = sortedGroupes.map(([ category, tempOfGroup ]) => ({
                type: 'expand',
                key: category,
                name: templateCategoryNames[category as GNodeTemplateCategories],
                sublist: {
                    type: 'floating',
                    list: tempOfGroup.map(template => ({
                        type: 'button',
                        key: template.id,
                        name: template.rows[0].name,
                        onClick: () => addNode(template),
                    }))
                } 
            }));
            
            const menuShape: FloatingMenuShape = {
                type: 'floating',
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

    

    if (!templateCatalog || !currentPanelRect) return null;

    const clientPos = offsetToClientPos(currentPanelRect, templateCatalog.offsetPosition);

    return (
        <MenuRoot
            type={'misc'}
            shape={menuShape}
            onClose={() => {
                dispatch(geometryEditorPanelsCloseTemplateCatalog({ panelId }))
            }}
            anchor={clientPos}
            onSearchUpdated={setSearchValue}
            center={templateCatalog.center}
        />
    );
}

export default GeometryTemplateCatalog;