import React from 'react';
import MenuVerticalDiv from '../styles/MenuFloatingDiv';
import { ButtonMenuElement, CommandMenuElement, ExpandMenuElement, MenuElement, MenuStore, SearchMenuElement, TitleMenuElement, FloatingMenuShape } from '../types';
import MenuButton from './MenuButton';
import MenuCommand from './MenuCommand';
import MenuExpand from './MenuExpand';
import MenuSearch from './MenuSearch';
import MenuTitle from './MenuTitle';

type SwitchProps<M extends MenuElement = MenuElement> = {
    depth: number;
    element: M;
    menuStore: MenuStore;
}

const MenuElementSwitch = (props: SwitchProps) => {
    const type = props.element.type;

    if (type === 'button')
        return <MenuButton {...props as SwitchProps<ButtonMenuElement>} />
    if (type === 'command')
        return <MenuCommand {...props as SwitchProps<CommandMenuElement>} />
    if (type === 'expand')
        return <MenuExpand  {...props as SwitchProps<ExpandMenuElement>} />
    if (type === 'title')
        return <MenuTitle  {...props as SwitchProps<TitleMenuElement>} />
    if (type === 'search')
        return <MenuSearch  {...props as SwitchProps<SearchMenuElement>} />

    return null;
}

interface Props {
    depth: number;
    menuStore: MenuStore;
    shape: FloatingMenuShape;

    left?: string;
    top?: string;
    bottom?: string;
    right?: string;
}

const MenuFloating = ({
    depth, menuStore, shape,
    left, top, bottom, right
}: Props) => {
    return (
        <MenuVerticalDiv
            left={left} top={top} bottom={bottom} right={right}
        >
            {
                shape.list.map(element =>
                    <MenuElementSwitch
                        key={element.key}
                        depth={depth}
                        menuStore={menuStore}
                        element={element}
                    />
                )
            }
        </MenuVerticalDiv>
    );
}

export default MenuFloating;