import React from 'react';
import { menuStoreSetElement } from '../hooks/useMenuStore';
import { MenuExpandDiv } from '../styles/MenuElementDiv';
import { ExpandMenuElement, MenuStackElement, MenuStore, Point } from '../types';
import MaterialSymbol from './MaterialSymbol';
import MenuVertical from './MenuVertical';

interface Props
{
    depth: number;
    menuStore: MenuStore;
    element: ExpandMenuElement;
}

const MenuExpand = ({ element, menuStore, depth }: Props) =>
{
    const { state: menuState, dispatch: menuDispatch } = menuStore;
    const currentStackEl = menuState.stack[depth] as MenuStackElement | undefined;

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
                menuDispatch(menuStoreSetElement({
                    depth,
                    element: {
                        key: element.name,
                        position,
                    }
                }));
            }}
            tabIndex={element.tabIndex}
        >
            <p>{ element.name }</p>
            <MaterialSymbol size={20}>chevron_right</MaterialSymbol>
            {
                currentStackEl?.key === element.name &&
                <MenuVertical
                    depth={depth + 1}
                    menuStore={menuStore}
                    shape={element.sublist}
                    left={`${currentStackEl.position.x}px`}
                    top={`${currentStackEl.position.y}px`}
                />
            }
        </MenuExpandDiv>
    );
}

export default MenuExpand;