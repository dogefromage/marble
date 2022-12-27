import React from 'react';
import { menuStoreSetElement } from '../hooks/useMenuStore';
import { MenuHorizontalExpandDiv } from '../styles/MenuElementDiv';
import MenuHorizontalDiv from '../styles/MenuHorizontalDiv';
import { HorizontalMenuShape, MenuStackElement, MenuStore, Point } from '../types';
import MenuVertical from './MenuVertical';

interface Props
{
    depth: number;
    menuStore: MenuStore;
    shape: HorizontalMenuShape;
}

const MenuHorizontal = ({ depth, menuStore, shape }: Props) =>
{
    const { state: menuState, dispatch: menuDispatch } = menuStore;
    const currentStackEl = menuState.stack[depth] as MenuStackElement | undefined;

    return (
        <MenuHorizontalDiv>
        {
            shape.list.map(expandElement =>
                <MenuHorizontalExpandDiv
                    key={expandElement.name}
                    onMouseEnter={e => {
                        const div = e.currentTarget as HTMLDivElement;
                        if (!div) return;
                        const rect = div.getBoundingClientRect();
                        const position: Point = {
                            x: 0,
                            y: rect.height,
                        }; // relative position
                        menuDispatch(menuStoreSetElement({
                            depth,
                            element: {
                                key: expandElement.name,
                                position,
                            }
                        }));
                    }}
                >
                    { expandElement.name }
                    {
                        currentStackEl?.key === expandElement.name &&
                        <MenuVertical
                            depth={depth + 1}
                            menuStore={menuStore}
                            shape={expandElement.sublist}
                            left={`${currentStackEl.position.x}px`}
                            top={`${currentStackEl.position.y}px`}
                        />
                    }
                </MenuHorizontalExpandDiv>
            )
        }
        </MenuHorizontalDiv>
    );
}

export default MenuHorizontal;