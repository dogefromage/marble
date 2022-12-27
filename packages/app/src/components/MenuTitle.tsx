import React from 'react';
import { MenuTitleDiv } from '../styles/MenuTitleDiv';
import { MenuStore, TitleMenuElement } from '../types';

interface Props
{
    depth: number;
    menuStore: MenuStore;
    element: TitleMenuElement;
}
const MenuTitle = ({ element }: Props) =>
{
    return (
        <MenuTitleDiv
            backColor={element.color}
        >
            <p>{ element.name }</p>
        </MenuTitleDiv>
    );
}

export default MenuTitle;