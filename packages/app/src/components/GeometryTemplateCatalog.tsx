import React, { useMemo } from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAddNode } from '../slices/geometriesSlice';
import { selectSingleMenu } from '../slices/menusSlice';
import { geometryEditorPanelsCloseTemplateCatalog } from '../slices/panelGeometryEditorSlice';
import { selectPanelClientRect } from '../slices/panelManagerSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { decomposeTemplateId, FloatingMenuShape, GNodeTemplate, GNodeTemplateCategory, MenuElement, SearchMenuElement, templateCategoryNames, TitleMenuElement, ViewTypes } from '../types';
import MenuRootFloating from './MenuRootFloating';

type GroupedTemplatesMap = {
    [C in GNodeTemplateCategory]: GNodeTemplate[];
}

interface Props {
    panelId: string;
    geometryId: string;
}

const SEARCH_ELEMENT_KEY = 'search';

const GeometryTemplateCatalog = ({ panelId, geometryId }: Props) => {
    const dispatch = useAppDispatch();
    const { templates } = useAppSelector(selectTemplates);

    const menuId = `template-catalog:${geometryId}`;
    const menuState = useAppSelector(selectSingleMenu(menuId));
    const searchValue = menuState?.state.get(SEARCH_ELEMENT_KEY) ?? '';

    const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));
    const currentPanelRect = useAppSelector(selectPanelClientRect(panelId));
    const templateCatalog = panelState?.templateCatalog;

    const addNode = (template: GNodeTemplate) => {
        if (!templateCatalog) return;
        dispatch(geometriesAddNode({
            geometryId,
            templateId: template.id,
            position: {
                x: templateCatalog.worldPosition.x,
                y: templateCatalog.worldPosition.y, 
            },
            undo: { desc: `Added new node to active geometry.` }
        }));
    }

    const menuShape = useMemo(() => {
        const allTemplates = (Object.values(templates) as GNodeTemplate[])
            .filter(template => {
            const { id, type } = decomposeTemplateId(template.id);

            const isForeignOutput = type === 'output' && id !== geometryId;
            const isForeignInput = type === 'input' && id.split(':')[0] !== geometryId;
            const isCurrentComposedTemplate = type === 'composite' && id === geometryId;

            return !isForeignOutput && !isCurrentComposedTemplate && !isForeignInput;
        });

        const title: TitleMenuElement = {
            type: 'title',
            key: 'title',
            name: 'Add Template',
            color: 'black',
        }
        const searchBar: SearchMenuElement = {
            key: SEARCH_ELEMENT_KEY,
            type: 'search',
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
        } else {
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
                name: templateCategoryNames[category as GNodeTemplateCategory],
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

    if (!templateCatalog || !currentPanelRect) return null;

    return (
        <MenuRootFloating
            menuId={menuId}
            menuType={'misc'}
            shape={menuShape}
            onClose={() => {
                dispatch(geometryEditorPanelsCloseTemplateCatalog({ panelId }))
            }}
            anchor={templateCatalog.menuAnchor}
        />
    );
}

export default GeometryTemplateCatalog;