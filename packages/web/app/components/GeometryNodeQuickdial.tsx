import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAddNode } from '../slices/geometriesSlice';
import { selectTemplates } from '../slices/templatesSlice';
import { Point } from '../types';
import Menu from './Menu';
import MenuItem from './MenuItem';
import MenuTitle from './MenuTitle';

interface Props
{
    geometryId: string;
    position: Point;
    onClose: () => void;
}

const GeometryTemplateSearcher = ({ position, onClose, geometryId }: Props) =>
{
    const dispatch = useAppDispatch();
    const templates = useAppSelector(selectTemplates).templates;
    
    const [ searchValue, setSearchValue ] = useState('');

    const selectedTemplates = useMemo(() =>
    {
        const all = Object.values(templates);
        if (!searchValue.length) return all;
        return all.filter(t => t.rows[0].name.toLowerCase().includes(searchValue.toLowerCase()));
    }, [ templates, searchValue ]);

    return (
        <Menu
            position={position}
            onUnfocus={onClose}
        >
            <MenuTitle 
                text='Add Node'
            />
            {/* <form>
                <input 
                    type='text'
                    value={searchValue}
                    onLoad={e =>
                    {
                        const el = (e.currentTarget as HTMLInputElement);
                        setTimeout(() =>
                        {
                            el.focus();
                        }, 10)
                    }}
                    onChange={e =>
                    {
                        setSearchValue((e.currentTarget as HTMLInputElement).value);
                    }}
                />
            </form> */}
            {
                selectedTemplates.map(template =>
                    <MenuItem
                        onClick={() =>
                        {
                            dispatch(geometriesAddNode({
                                geometryId,
                                template,
                                position: { x: 100, y: 100 },
                                undo: {}
                            }));
                            onClose();
                        }}
                        key={template.id}
                        text={template.rows[0].name}
                    />
                )
            }
        </Menu>
    );
}

export default GeometryTemplateSearcher;