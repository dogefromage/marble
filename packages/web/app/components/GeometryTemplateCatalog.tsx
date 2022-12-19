import { useEffect, useMemo, useState } from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAddNode } from '../slices/geometriesSlice';
import { geometryEditorPanelsCloseTemplateCatalog } from '../slices/panelGeometryEditorSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { GNodeT, GNodeTemplateCategories, TEMPLATE_CATEGORY_NAMES, ViewTypes } from '../types';
import { NODE_WIDTH } from './GeometryNode';
import Menu from './Menu';
import MenuExpand from './MenuExpand';
import MenuItem from './MenuItem';
import MenuSearch from './MenuSearch';
import MenuTitle from './MenuTitle';

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
    const filteredTemplates = useMemo(() =>
    {
        const all = Object.values(templates);
        if (!searchValue.length) return all;
        return all.filter(t => t.rows[0].name.toLowerCase().includes(searchValue.toLowerCase()));
    }, [ templates, searchValue ]);

    const useFiltered = searchValue.length > 0;

    // group all templates by category
    const sortedGroups = useMemo(() => {
        const groupedTemplatesMap = Object.values(templates)
            .reduce((groupes, current) =>
        {
            const key = current.category;
            if (groupes[key] == null) { groupes[key] = []; }
            groupes[key].push(current);
            return groupes;
        }, {} as GroupedTemplatesMap);
        return Object.entries(groupedTemplatesMap)
            .sort((group1, group2) => {
                const cat1 = group1[0].toLowerCase();
                const cat2 = group2[0].toLowerCase();
                if (cat1 === cat2) return 0;
                return cat1 > cat2 ? 1 : -1;
            });
    }, [ templates ]);


    const closeMenu = () => dispatch(geometryEditorPanelsCloseTemplateCatalog({ panelId }));

    const addNode = (template: GNodeT) =>
    {
        if (!panelState?.geometryId || 
            !panelState?.templateCatalog) return;

        dispatch(geometriesAddNode({
            geometryId: panelState.geometryId,
            template,
            position: {
                x: panelState.templateCatalog.worldPosition.x - 0.5 * NODE_WIDTH,
                y: panelState.templateCatalog.worldPosition.y, 
            },
            undo: {}
        }));
        closeMenu();
    }

    useEffect(() =>
    {
        setSearchValue('');
    }, [ panelState?.templateCatalog ])

    if (!panelState?.templateCatalog) return null;

    return (
        <Menu
            position={panelState.templateCatalog.offsetPosition}
            onUnfocus={closeMenu}
            center={panelState.templateCatalog.center}
        >
            <MenuTitle 
                text='Add Node'
            />
            <MenuSearch 
                value={searchValue}
                onChange={setSearchValue}
                onSubmit={() =>
                {
                    if (filteredTemplates.length === 1)
                        addNode(filteredTemplates[0]);
                }}
                placeholder='Search...'
                autoFocus={true}
            />
            {
                useFiltered ? (
                    filteredTemplates.map(template =>
                        <MenuItem
                            onClick={() => addNode(template)}
                            key={template.id}
                            text={template.rows[0].name}
                        />
                    )
                ) : (
                    sortedGroups.map(([ category, templatesOfCategory ]) =>
                        <MenuExpand
                            key={category}
                            name={TEMPLATE_CATEGORY_NAMES[category]}
                        >
                        {
                            templatesOfCategory.map(template =>
                                <MenuItem
                                    onClick={() => addNode(template)}
                                    key={template.id}
                                    text={template.rows[0].name}
                                />
                            )
                        }
                        </MenuExpand>
                    )
                )
            }
        </Menu>
    );
}

export default GeometryTemplateCatalog;