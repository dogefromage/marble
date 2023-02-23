import { current } from 'immer';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { menusSetNode, selectSingleMenu } from '../slices/menusSlice';
import MaterialSymbol from '../styles/MaterialSymbol';
import { MenuExpandDiv } from '../styles/MenuElementDiv';
import { ExpandMenuElement, MenuStackNode, Point } from '../types';
import MenuFloating, { MenuElementProps } from './MenuFloating';

const MenuExpand = ({ menuId, element, depth }: MenuElementProps<ExpandMenuElement>) => {
    const dispatch = useAppDispatch();
    const menu = useAppSelector(selectSingleMenu(menuId));
    if (!menu) return null;
    
    const currentStackEl = menu.nodeStack[depth] as MenuStackNode | undefined;

    return (
        <MenuExpandDiv
            onMouseEnter={e => {
                const div = e.currentTarget as HTMLDivElement;
                if (!div) return;
                const rect = div.getBoundingClientRect();
                const position: Point = {
                    x: rect.width,
                    y: 0,
                }; // relative position
                dispatch(menusSetNode({
                    menuId,
                    depth,
                    node: { key: element.key, position }
                }));
            }}
            tabIndex={element.tabIndex}
        >
            <p>{element.name}</p>
            <MaterialSymbol size={20}>chevron_right</MaterialSymbol> {
                currentStackEl?.key === element.key &&
                <MenuFloating
                    menuId={menuId}
                    depth={depth + 1}
                    shape={element.sublist}
                    anchor={currentStackEl.position}
                />
            }
        </MenuExpandDiv>
    );
}

export default MenuExpand;