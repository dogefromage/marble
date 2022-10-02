import { template } from 'lodash';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '../redux/hooks';
import { geometriesAddNode } from '../slices/geometriesSlice';
import { GNodeT, ObjMap, Point } from '../types';

interface DivProps
{
    position: Point;
}

const DialInputDiv = styled.div.attrs<DivProps>(({ position }) =>
{
    return {
        style: {
            left: `${position.x}px`,
            top: `${position.y}px`,
        }
    }
})<DivProps>`
    
    position: fixed;
    transform: translate(-50%, -50%);

    padding: 0.5rem;

    background-color: white;
    border: solid 1px black;
`;

interface Props
{
    position: Point;
    templates: ObjMap<GNodeT>;
    onClose: () => void;
    geometryId: string;
}

const GeometryNodeQuickdial = ({ position, templates, onClose, geometryId }: Props) =>
{
    const dispatch = useAppDispatch();

    const [ searchValue, setSearchValue ] = useState('');

    const selectedTemplates = useMemo(() =>
    {
        const all = Object.values(templates);

        if (!searchValue.length) return all;
        
        return all.filter(t => t.rows[0].name.toLowerCase().includes(searchValue.toLowerCase()));

    }, [ template, searchValue ]);

    return (
        <DialInputDiv
            position={position}
        >
            <form>
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
            </form>
            {
                selectedTemplates.map(template =>
                    <p
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
                    >
                        { template.rows[0].name }
                    </p>
                )
            }
        </DialInputDiv>
    );
}

export default GeometryNodeQuickdial;