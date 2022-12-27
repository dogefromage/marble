import React, { useEffect, useRef } from 'react';
import useClickedOutside from '../hooks/useClickedOutside';
import useMenuStore, { menuStoreClose } from '../hooks/useMenuStore';
import { HorizontalMenuShape, MenuShape, MenuTypes, Point, VerticalMenuShape } from '../types';
import MenuHorizontal from './MenuHorizontal';
import MenuVertical from './MenuVertical';

interface Props
{
    type: MenuTypes;
    shape: MenuShape
    anchor?: Point;
    onSearchUpdated?: (newValue: string) => void;
    onClose?: () => void;
}

const INITIAL_DEPTH = 0;

const MenuRoot = ({ type, anchor, shape, onClose, onSearchUpdated }: Props) =>
{
    const menuStore = useMenuStore(type);
    const wrapperDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (onClose && menuStore.state.closed) 
            onClose();
    }, [ menuStore.state.closed ]);

    useEffect(() => {
        onSearchUpdated?.(menuStore.state.searchValue);
    }, [ menuStore.state.searchValue ]);

    useClickedOutside(wrapperDivRef, () => {
        menuStore.dispatch(menuStoreClose());
    });

    let left: string | undefined, top: string | undefined;
    if (anchor != null) {
        left = `${anchor.x}px`;
        top = `${anchor.y}px`;
    }

    return (
        <div
            ref={wrapperDivRef}
        >
        {
            shape.type === 'vertical' ? (
                <MenuVertical
                    depth={INITIAL_DEPTH}
                    menuStore={menuStore}
                    shape={shape as VerticalMenuShape}
                    left={left}
                    top={top}
                />
            ) : (
                <MenuHorizontal 
                    depth={INITIAL_DEPTH}
                    menuStore={menuStore}
                    shape={shape as HorizontalMenuShape}
                />
            )
        }
        </div>
    );
}

export default MenuRoot;