import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import useClickedOutside from '../hooks/useClickedOutside';
import useStopMouseEvents from '../hooks/useStopMouseEvents';
import { useAppDispatch } from '../redux/hooks';
import { menusSetClosed } from '../slices/menusSlice';
import { FloatingMenuShape, MenuTypes, Vec2 } from '../types';
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
    anchor: Vec2;
}

const MenuRootFloating = ({ menuId, menuType, shape, onClose, anchor }: Props) => {

    const { menuState } = useBindMenuState(menuId, menuType);
    const wrapperDivRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (menuState?.isClosed) {
            onClose();
        }
    });

    const close = () => {
        dispatch(menusSetClosed({ menuId }));
    }
    useClickedOutside(wrapperDivRef, close);

    const stopMouseHandlers = useStopMouseEvents();

    return ReactDOM.createPortal(
        <FixedFullscreenDiv
            {...stopMouseHandlers} 
            ref={wrapperDivRef}
        >
            <MenuFloating
                menuId={menuId}
                depth={0}
                shape={shape as FloatingMenuShape}
                leftAnchor={anchor}
                parentWidth={0}
            />
        </FixedFullscreenDiv>,
        document.querySelector(`#${MENU_PORTAL_MOUNT_ID}`)!
    );
}

export default MenuRootFloating;
