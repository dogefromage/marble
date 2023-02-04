import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import useClickedOutside from '../hooks/useClickedOutside';
import useTrigger from '../hooks/useTrigger';
import { useAppDispatch } from '../redux/hooks';
import { menusSetClosed } from '../slices/menusSlice';
import { VERTICAL_MENU_WIDTH } from '../styles/MenuFloatingDiv';
import { FloatingMenuShape, MenuTypes, Point } from '../types';
import { useBindMenuState } from '../utils/menus';
import MenuFloating from './MenuFloating';
import { MENU_PORTAL_MOUNT_ID } from './MenuPortalMount';

const FixedFullscreenDiv = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
`;

interface Props {
    menuId: string;
    menuType: MenuTypes;
    shape: FloatingMenuShape
    onClose: () => void;
    anchor: Point;
    center?: boolean;
}

const MenuRootFloating = ({ menuId, menuType, anchor, shape, onClose, center }: Props) => {
    const { menuState } = useBindMenuState(menuId, menuType);
    const wrapperDivRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (menuState?.isClosed) {
            onClose();
        }
    });

    useClickedOutside(wrapperDivRef, () => {
        dispatch(menusSetClosed({ menuId }));
    });

    let x = anchor.x;
    let y = anchor.y;
    if (center) {
        x -= 0.5 * VERTICAL_MENU_WIDTH;
    }

    return ReactDOM.createPortal(
        <FixedFullscreenDiv ref={wrapperDivRef}>
            <MenuFloating
                menuId={menuId}
                depth={0}
                shape={shape as FloatingMenuShape}
                left={`${x}px`}
                top={`${y}px`}
            />
        </FixedFullscreenDiv>,
        document.querySelector(`#${MENU_PORTAL_MOUNT_ID}`)!
    );
}

export default MenuRootFloating;
