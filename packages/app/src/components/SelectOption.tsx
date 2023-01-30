import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { GNODE_ROW_UNIT_HEIGHT } from '../styles/GeometryRowDiv';
import { BORDER_RADIUS } from '../styles/utils';
import { MenuShape, ObjMap } from '../types';
import MaterialSymbol from './MaterialSymbol';
import MenuRoot from './MenuRoot';

const SelectOptionDiv = styled.div`
    position: relative;

    height: 30px;

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

const SelectOption = ({ value, onChange, options, mapName }: SelectOptionProps) => {
    const [ dropdown, setDropdown ] = useState(false);

    const menuShape: MenuShape = useMemo(() => ({
        type: 'vertical',
        list: options.map((option, index) => ({
            type: 'button',
            name: mapName?.[ option ] || option,
            key: option,
            tabIndex: 1 + index,
            onClick: () => {
                onChange(option);
                setDropdown(() => false);
            }
        })),
    }), [ options ]);

    return (
        <SelectOptionDiv
            onClick={() => setDropdown(true)}
        >
            <p>{mapName?.[ value ] ?? value}</p>
            {
                dropdown &&
                <MenuRoot
                    type={'misc'}
                    shape={menuShape}
                    anchor={{ x: 0, y: 0 }}
                    onClose={() => setDropdown(false)}
                />
            }
            <MaterialSymbol size={20}>expand_more</MaterialSymbol>
        </SelectOptionDiv>
    );
}

export default SelectOption;