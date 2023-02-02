import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import useClickedOutside from '../hooks/useClickedOutside';
import { useAppDispatch } from '../redux/hooks';
import { menusClose } from '../slices/menusSlice';
import { VERTICAL_MENU_WIDTH } from '../styles/MenuFloatingDiv';
import { FloatingMenuShape, InlineMenuShape, MenuShape, MenuTypes, Point } from '../types';
import { useBindMenuState } from '../utils/menus';
import { MENU_PORTAL_MOUNT_ID } from './MenuPortalMount';
import MenuInline from './MenuInline';
import MenuFloating from './MenuFloating';

const FixedFullscreenDiv = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
`;

interface Props {
    menuId: string;
    menuType: MenuTypes;
    shape: MenuShape
    onClose: () => void;
    anchor?: Point;
    center?: boolean;
}

const INITIAL_DEPTH = 0;

const MenuRoot = ({ menuId, menuType, anchor, shape, onClose, center }: Props) => {
    const menuState = useBindMenuState(menuId, menuType);
    const wrapperDivRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();

    if (menuState?.isClosed) {
        onClose();
    }

    useClickedOutside(wrapperDivRef, () => {
        dispatch(menusClose({ menuId }));
    });

    if (shape.type === 'inline') {
        return (
            <div ref={wrapperDivRef}>
                <MenuInline
                    menuId={menuId}
                    shape={shape as InlineMenuShape}
                    depth={INITIAL_DEPTH}
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
                menuId={menuId}
                depth={INITIAL_DEPTH}
                shape={shape as FloatingMenuShape}
                left={left}
                top={top}
            />
        </FixedFullscreenDiv>,
        document.querySelector(`#${MENU_PORTAL_MOUNT_ID}`)!
    );
}

export default MenuRoot;