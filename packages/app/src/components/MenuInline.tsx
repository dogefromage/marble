import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { menusSetNode, selectSingleMenu } from '../slices/menusSlice';
import { MenuHorizontalExpandDiv as MenuInlineExpandDiv } from '../styles/MenuElementDiv';
import MenuInlineDiv from '../styles/MenuInlineDiv';
import { InlineMenuShape, MenuStackNode, Point } from '../types';
import MenuFloating from './MenuFloating';

interface Props {
    menuId: string;
    depth: number;
    shape: InlineMenuShape;
}

const MenuInline = ({ menuId, depth, shape }: Props) => {
    const dispatch = useAppDispatch();
    const menu = useAppSelector(selectSingleMenu(menuId));
    if (!menu) return null;

    const currentStackEl = menu.nodeStack[depth] as MenuStackNode | undefined;

    return (
        <MenuInlineDiv> {
            shape.list.map(expandElement =>
                <MenuInlineExpandDiv
                    key={expandElement.name}
                    onMouseEnter={e => {
                        const div = e.currentTarget as HTMLDivElement;
                        if (!div) return;
                        const rect = div.getBoundingClientRect();
                        const position: Point = {
                            x: 0,
                            y: rect.height,
                        }; // relative position
                        dispatch(menusSetNode({
                            menuId,
                            depth,
                            node: { key: expandElement.key, position }
                        }));
                    }}
                >
                    { expandElement.name } {
                        currentStackEl?.key === expandElement.key &&
                        <MenuFloating
                            menuId={menuId}
                            depth={depth + 1}
                            shape={expandElement.sublist}
                            left={`${currentStackEl.position.x}px`}
                            top={`${currentStackEl.position.y}px`}
                        />
                    }
                </MenuInlineExpandDiv>
            )
        }
        </MenuInlineDiv>
    );
}

export default MenuInline;