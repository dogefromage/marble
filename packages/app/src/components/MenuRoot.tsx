import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import useClickedOutside from '../hooks/useClickedOutside';
import useMenuStore, { menuStoreClose } from '../hooks/useMenuStore';
import { VERTICAL_MENU_WIDTH } from '../styles/MenuFloatingDiv';
import { InlineMenuShape, MenuShape, MenuTypes, Point, FloatingMenuShape } from '../types';
import { CONTEXT_MENU_PORTAL_MOUNT_ID } from './ContextMenuPortalMount';
import MenuInline from './MenuHorizontal';
import MenuFloating from './MenuVertical';

const FixedFullscreenDiv = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
`;

interface Props {
    type: MenuTypes;
    shape: MenuShape
    anchor?: Point;
    center?: boolean;
    onSearchUpdated?: (newValue: string) => void;
    onClose?: () => void;
}

const INITIAL_DEPTH = 0;

const MenuRoot = ({ type, anchor, shape, onClose, onSearchUpdated, center }: Props) => {
    const menuStore = useMenuStore(type);
    const wrapperDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (onClose && menuStore.state.closed)
            onClose();
    }, [menuStore.state.closed]);

    useEffect(() => {
        onSearchUpdated?.(menuStore.state.searchValue);
    }, [menuStore.state.searchValue]);

    useClickedOutside(wrapperDivRef, () => {
        menuStore.dispatch(menuStoreClose());
    });

    if (shape.type === 'inline') {
        return (
            <div ref={wrapperDivRef}>
                <MenuInline
                    depth={INITIAL_DEPTH}
                    menuStore={menuStore}
                    shape={shape as InlineMenuShape}
                />
            </div>
        )
    }

    let left: string | undefined, 
        top: string | undefined;
    if (anchor) {
        left = `${ center ? anchor.x - 0.5 * VERTICAL_MENU_WIDTH : anchor.x }px`; 
        top  = `${ anchor.y }px`;
    }

    return ReactDOM.createPortal(
        <FixedFullscreenDiv ref={wrapperDivRef}>
            <MenuFloating
                depth={INITIAL_DEPTH}
                menuStore={menuStore}
                shape={shape as FloatingMenuShape}
                left={left}
                top={top}
            />
        </FixedFullscreenDiv>,
        document.querySelector(`#${CONTEXT_MENU_PORTAL_MOUNT_ID}`)!
    );
}

export default MenuRoot;