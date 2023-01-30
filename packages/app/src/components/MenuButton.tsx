import React from 'react';
import { menuStoreClose } from '../hooks/useMenuStore';
import { MenuElementDiv } from '../styles/MenuElementDiv';
import { ButtonMenuElement, MenuStore } from '../types';

interface Props
{
    depth: number;
    menuStore: MenuStore;
    element: ButtonMenuElement;
}

const MenuButton = ({ menuStore, element }: Props) =>
{
    return (
        <MenuElementDiv
            onClick={() => {
                menuStore.dispatch(menuStoreClose());
                element.onClick();
            }}
            tabIndex={element.tabIndex}
        >
        {
            <p>{ element.name }</p>
        }
        </MenuElementDiv>
    );
}

export default MenuButton;