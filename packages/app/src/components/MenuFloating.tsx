import useResizeObserver from '@react-hook/resize-observer';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import { selectSingleMenu } from '../slices/menusSlice';
import MenuFloatingDiv from '../styles/MenuFloatingDiv';
import { ButtonMenuElement, ColorMenuElement, CommandMenuElement, ExpandMenuElement, FloatingMenuShape, MenuElement, Point, Rect, SearchMenuElement, Size, TitleMenuElement } from '../types';
import MenuButton from './MenuButton';
import MenuColor from './MenuColor';
import MenuCommand from './MenuCommand';
import MenuExpand from './MenuExpand';
import MenuSearch from './MenuSearch';
import MenuTitle from './MenuTitle';

export type MenuElementProps<M extends MenuElement = MenuElement> = {
    menuId: string;
    depth: number;
    element: M;
}

const MenuElementSwitch = (props: MenuElementProps) => {
    const type = props.element.type;
    if (type === 'button')
        return <MenuButton {...props as MenuElementProps<ButtonMenuElement>} />
    if (type === 'command')
        return <MenuCommand {...props as MenuElementProps<CommandMenuElement>} />
    if (type === 'expand')
        return <MenuExpand  {...props as MenuElementProps<ExpandMenuElement>} />
    if (type === 'title')
        return <MenuTitle  {...props as MenuElementProps<TitleMenuElement>} />
    if (type === 'search')
        return <MenuSearch  {...props as MenuElementProps<SearchMenuElement>} />
    if (type === 'color')
        return <MenuColor  {...props as MenuElementProps<ColorMenuElement>} />
    
    console.error(`Unknown menu element: ${type}`);
    return null;
}

interface Props {
    menuId: string;
    depth: number;
    shape: FloatingMenuShape;
    anchor: Point;
    // anchorDir: 'left' | 'right';
}

function adjustAnchorVertically(availableSpace: Rect, preferredAnchor: Point, menuSize: Size) {
    return preferredAnchor;
}

const MenuFloating = ({ menuId, depth, shape, anchor, /* anchorDir */ }: Props) => {
    const menu = useAppSelector(selectSingleMenu(menuId));
    if (!menu) return null;
    const { availableSpace } = menu;

    const difRev = useRef<HTMLDivElement>(null);
    const [ menuSize, setMenuSize ] = useState<Size>({ w: 0, h: 0 });

    const adjustedAnchor = useMemo(() => 
        adjustAnchorVertically(availableSpace, anchor, menuSize), 
        [ availableSpace, anchor, /* menuSize */ ],
    );
    useEffect(() => {
        console.log({ menuSize });
    }, [ menuSize ]);

    useResizeObserver(difRev, observer => {
        setMenuSize({
            w: observer.contentRect.width,
            h: observer.contentRect.height,
        });
    });

    return (
        <MenuFloatingDiv ref={difRev} anchor={adjustedAnchor}> {
            shape.list.map(element =>
                <MenuElementSwitch
                    menuId={menuId}
                    key={element.key}
                    depth={depth}
                    element={element}
                />
            )
        }
        </MenuFloatingDiv>
    );
}

export default MenuFloating;