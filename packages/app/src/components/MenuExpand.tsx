import React, { useState } from 'react';
import styled from 'styled-components';
import { MenuItemText } from '../styles/MenuItemText';
import MaterialSymbol from './MaterialSymbol';
import Menu from './Menu';
import MenuItem from './MenuItem';

interface DivProps
{
    // placeRight: boolean;
}

const MenuExpandDiv = styled.div<DivProps>`
    position: relative;

    .expand-name-div {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
    }
`;

interface Props
{
    name: string;
    children: React.ReactNode;
}

const MenuExpand = ({ name, children }: Props) =>
{
    const [ show, setShow ] = useState(false);

    const showExpanded = () => setShow(true);
    const hideExpanded = () => setShow(false);

    const placeRight = true;

    return (
        <MenuExpandDiv
            onMouseEnter={showExpanded}
            onMouseLeave={hideExpanded}
            // placeRight={placeRight}
        >
            <MenuItem>
                <div className='expand-name-div'>
                    <MenuItemText>
                        { name }
                    </MenuItemText>
                    <MaterialSymbol size={20}>chevron_right</MaterialSymbol>
                </div>
            </MenuItem>            
            {
                show &&
                <Menu
                    position={{ x: 0, y: 0 }}
                    onUnfocus={() => {}}
                    anchorRight={placeRight}
                >
                    { children }
                </Menu>
            }
        </MenuExpandDiv>
    );
}

export default MenuExpand;