import React, { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { GNODE_ROW_UNIT_HEIGHT } from '../styles/GeometryRowDiv';
import { BORDER_RADIUS, BOX_SHADOW } from '../styles/utils';
import { MenuShape, ObjMap, Point } from '../types';
import MaterialSymbol from '../styles/MaterialSymbol';
import MenuRoot from './MenuRoot';

const SelectOptionDiv = styled.div`
    position: relative;

    height: 1.6rem;
    max-height: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.3rem;
    
    padding: 0 0.5rem;
    ${BORDER_RADIUS}
    background-color: ${({ theme }) => theme.colors.general.fields};

    cursor: pointer;

    p {
        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
`;

export interface SelectOptionProps {
    value: string;
    options: string[];
    onChange: (newValue: string) => void;
    mapName?: ObjMap<string>;
}

const FormSelectOption = ({ value, onChange, options, mapName }: SelectOptionProps) => {
    const [ dropdown, setDropdown ] = useState<{
        anchor: Point;
    }>();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const menuShape: MenuShape = useMemo(() => ({
        type: 'floating',
        list: options.map((option, index) => ({
            type: 'button',
            name: mapName?.[ option ] || option,
            key: option,
            tabIndex: 1 + index,
            onClick: () => {
                onChange(option);
                setDropdown(undefined);
            }
        })),
    }), [ options ]);

    return (
        <SelectOptionDiv
            onClick={() => {
                const rect = wrapperRef.current!.getBoundingClientRect();
                setDropdown({
                    anchor: { x: rect.left, y: rect.top }
                });
            }}
            ref={wrapperRef}
        >
            <p>{mapName?.[ value ] ?? value}</p>
            {
                dropdown &&
                <MenuRoot
                    type={'misc'}
                    shape={menuShape}
                    anchor={dropdown.anchor}
                    onClose={() => setDropdown(undefined)}
                />
            }
            <MaterialSymbol size={20}>expand_more</MaterialSymbol>
        </SelectOptionDiv>
    );
}

export default FormSelectOption;