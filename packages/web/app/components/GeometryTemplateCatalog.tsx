import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAddNode } from '../slices/geometriesSlice';
import { geometryEditorPanelCloseTemplateCatalog, selectGeometryEditorPanels } from '../slices/panelGeometryEditorSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { GNODE_ROW_UNIT_HEIGHT } from '../styled/GeometryRowDiv';
import { GNodeT, ViewProps } from '../types';
import countHeightUnits from '../utils/geometries/countHeightUnits';
import { usePanelState } from '../utils/panelState/usePanelState';
import { NODE_WIDTH } from './GeometryNode';
import Menu from './Menu';
import MenuItem from './MenuItem';
import MenuSearch from './MenuSearch';
import MenuTitle from './MenuTitle';

interface Props
{
    viewProps: ViewProps;
}

const GeometryTemplateCatalog = ({ viewProps }: Props) =>
{
    const dispatch = useAppDispatch();
    const templates = useAppSelector(selectTemplates).templates;
    const panelState = usePanelState(selectGeometryEditorPanels, viewProps.panelId);
    
    const [ searchValue, setSearchValue ] = useState('');

    const filteredTemplates = useMemo(() =>
    {
        const all = Object.values(templates);
        if (!searchValue.length) return all;
        return all.filter(t => t.rows[0].name.toLowerCase().includes(searchValue.toLowerCase()));
    }, [ templates, searchValue ]);

    const closeMenu = () => dispatch(geometryEditorPanelCloseTemplateCatalog({ panelId: viewProps.panelId }));

    const addNode = (template: GNodeT) =>
    {
        if (!panelState?.geometryId || 
            !panelState?.templateCatalog) return;

        const nodeHeight = GNODE_ROW_UNIT_HEIGHT * countHeightUnits(template.rows, 1000);

        dispatch(geometriesAddNode({
            geometryId: panelState.geometryId,
            template,
            position: {
                x: panelState.templateCatalog.worldPosition.x - 0.5 * NODE_WIDTH,
                y: panelState.templateCatalog.worldPosition.y - 0.5 * nodeHeight, 
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
            position={panelState.templateCatalog.clientPosition}
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
                filteredTemplates.map(template =>
                    <MenuItem
                        onClick={() => addNode(template)}
                        key={template.id}
                        text={template.rows[0].name}
                    />
                )
            }
        </Menu>
    );
}

export default GeometryTemplateCatalog;