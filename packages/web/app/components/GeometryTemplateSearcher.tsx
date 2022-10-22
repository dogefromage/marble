import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAddNode } from '../slices/geometriesSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { GNODE_ROW_UNIT_HEIGHT } from '../styled/GeometryRowDiv';
import { GNodeT, Point } from '../types';
import countHeightUnits from '../utils/geometries/countHeightUnits';
import { NODE_WIDTH } from './GeometryNode';
import Menu from './Menu';
import MenuItem from './MenuItem';
import MenuSearch from './MenuSearch';
import MenuTitle from './MenuTitle';

interface Props
{
    geometryId: string;
    menuPosition: Point;
    nodeSpawnPosition: Point;
    onClose: () => void;
}

const GeometryTemplateSearcher = ({ menuPosition, onClose, geometryId, nodeSpawnPosition }: Props) =>
{
    const dispatch = useAppDispatch();
    const templates = useAppSelector(selectTemplates).templates;
    
    const [ searchValue, setSearchValue ] = useState('');

    const filteredTemplates = useMemo(() =>
    {
        const all = Object.values(templates);
        if (!searchValue.length) return all;
        return all.filter(t => t.rows[0].name.toLowerCase().includes(searchValue.toLowerCase()));
    }, [ templates, searchValue ]);

    const addNode = (template: GNodeT) =>
    {
        const nodeHeight = GNODE_ROW_UNIT_HEIGHT * countHeightUnits(template.rows, 1000);

        dispatch(geometriesAddNode({
            geometryId,
            template,
            position: {
                x: nodeSpawnPosition.x - 0.5 * NODE_WIDTH,
                y: nodeSpawnPosition.y - 0.5 * nodeHeight, 
            },
            undo: {}
        }));
        onClose();
    }

    return (
        <Menu
            position={menuPosition}
            onUnfocus={onClose}
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

export default GeometryTemplateSearcher;