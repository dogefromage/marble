import React, { useMemo } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { GNODE_ROW_UNIT_HEIGHT } from '../styles/GeometryRowDiv';
import { MenuShape, MenuTypes } from '../types';
import MaterialSymbol from './MaterialSymbol';
import MenuRoot from './MenuRoot';

const SelectOptionDiv = styled.div`
    position: relative;
    z-index: 1;

    height: ${GNODE_ROW_UNIT_HEIGHT * 0.8}px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    margin: ${GNODE_ROW_UNIT_HEIGHT * 0.1}px 0;
    
    padding: 0 0.5em;
    /* border: dashed 1px #00000079; */
    border-radius: 3px;
    background-color: #e5e4eb;
    /* box-shadow: 2px 2px #00000033; */

    p
    {
        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
`;

interface Props
{
    value: string;
    options: string[];
    onChange: (newValue: string) => void;
}

const SelectOption = ({ value, onChange, options }: Props) =>
{
    const [ dropdown, setDropdown ] = useState(false);

    const menuShape: MenuShape = useMemo(() => {
        return {
            type: 'vertical',
            list: options.map(option => ({
                type: 'button',
                name: option,
                onClick: () => {
                    onChange(option);
                    setDropdown(() => false);
                }
            })),
        };
    }, [ options ]);

    return (
        <SelectOptionDiv
            onClick={() => setDropdown(true)}
        > 
        {
            dropdown ? (
                <MenuRoot
                    type={MenuTypes.Misc}
                    shape={menuShape}
                    anchor={{ x: 0, y: 0 }}
                    onClose={() => setDropdown(false)}
                />
            ) : (
                <>
                    <p>{ value }</p>
                    <MaterialSymbol
                        size={20}
                        style={{ transform: 'translate(6.5px)' }}
                    >expand_more</MaterialSymbol>
                </>
            )
        }
        </SelectOptionDiv>
    );
}

export default SelectOption;