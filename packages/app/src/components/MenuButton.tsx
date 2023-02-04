import React from 'react';
import { useAppDispatch } from '../redux/hooks';
import { menusSetClosed } from '../slices/menusSlice';
import { MenuElementDiv } from '../styles/MenuElementDiv';
import { ButtonMenuElement } from '../types';
import { MenuElementProps } from './MenuFloating';

const MenuButton = ({ menuId, element }: MenuElementProps<ButtonMenuElement>) => {
    const dispatch = useAppDispatch();
    return (
        <MenuElementDiv
            onClick={e => {
                dispatch(menusSetClosed({ menuId }));
                element.onClick(e);
            }}
            tabIndex={element.tabIndex}
        > {
            <p>{element.name}</p>
        }
        </MenuElementDiv>
    );
}

export default MenuButton;