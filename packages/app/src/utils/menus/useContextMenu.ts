import React from "react";
import { useAppDispatch } from "../../redux/hooks";
import { contextMenuOpen } from "../../slices/contextMenuSlice";
import { CommandParameterMap, Point } from "../../types";

export default function useContextMenu(
    panelId: string,
    menuName: string,
    commandIds: string[],
    paramMapCallback?: (e: React.MouseEvent) => CommandParameterMap,
) {
    const dispatch = useAppDispatch();

    const openContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const position: Point = {
            x: e.clientX,
            y: e.clientY,
        };

        const paramMap = paramMapCallback?.(e) || {};

        dispatch(contextMenuOpen({ contextMenu: {
            panelId,
            name: menuName,
            position,
            commandIds,
            paramMap: {
                ...paramMap,
                clientCursor: {
                    x: e.clientX,
                    y: e.clientY,
                }
            },
        }}));
    }

    return openContextMenu;
}