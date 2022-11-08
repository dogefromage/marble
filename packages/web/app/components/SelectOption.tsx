import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { GNODE_ROW_UNIT_HEIGHT } from '../styled/GeometryRowDiv';
import MaterialSymbol from './MaterialSymbol';
import Menu from './Menu';

const SelectOptionDiv = styled.div`
    position: relative;
    width: 100%;
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
    }
`;

const DownArrow = styled(MaterialSymbol).attrs(() =>
{
    return {
        name: 'expand_more',
        size: 20,
    };
})`
    transform: translate(6.5px);
`;

interface Props
{
    value: string;
    onChange: (newValue: string) => void;
}

const SelectOption = ({ value, onChange }: Props) =>
{
    const [ open, setOpen ] = useState(false);
    const menuRef = useRef<{

    }>();

    const openSelect = () =>
    {
        setOpen(true);
        menuRef.current = {
            
        }
    };

    return (
        <SelectOptionDiv>
        {
            open ? (
                <Menu
                    position={}
                >

                </Menu>
            ) : (
                <div
                    onClick={openSelect}
                >
                    <p>{ value }</p>
                    <DownArrow />
                </div>
            )
        }
        </SelectOptionDiv>
    );
}

export default SelectOption;