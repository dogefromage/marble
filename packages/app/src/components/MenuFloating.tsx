import React from 'react';
import MenuFloatingDiv from '../styles/MenuFloatingDiv';
import { ButtonMenuElement, CommandMenuElement, ExpandMenuElement, FloatingMenuShape, MenuElement, SearchMenuElement, TitleMenuElement } from '../types';
import MenuButton from './MenuButton';
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
    return null;
}

interface Props {
    menuId: string;
    depth: number;
    shape: FloatingMenuShape;
    left?: string;
    top?: string;
    bottom?: string;
    right?: string;
}

const MenuFloating = ({ menuId, depth, shape, left, top, bottom, right }: Props) => {
    return (
        <MenuFloatingDiv left={left} top={top} bottom={bottom} right={right}> {
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