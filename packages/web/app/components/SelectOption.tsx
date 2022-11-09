import { useState } from 'react';
import styled from 'styled-components';
import { GNODE_ROW_UNIT_HEIGHT } from '../styled/GeometryRowDiv';
import MaterialSymbol from './MaterialSymbol';
import Menu from './Menu';
import MenuItem from './MenuItem';

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

const DownArrow = styled(MaterialSymbol).attrs(() =>
{
    return {
        size: 20,
    };
})`
    transform: translate(6.5px);
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

    return (
        <SelectOptionDiv
            onClick={() => setDropdown(true)}
        >
        {
            dropdown ? (
                <Menu
                    onUnfocus={() => setDropdown(false)}
                    position={{ x: 0, y: 0 }}
                >
                {
                    options.map(option =>
                        <MenuItem
                            key={option}
                            text={option}
                            onClick={e => 
                            {
                                onChange(option);
                                setDropdown(() => false);
                                e.stopPropagation();
                            }}
                        />   
                    )
                }
                </Menu>
            ) : (
                <>
                    <p>{ value }</p>
                    <DownArrow>expand_more</DownArrow>
                </>
            )
        }
        </SelectOptionDiv>
    );
}

export default SelectOption;