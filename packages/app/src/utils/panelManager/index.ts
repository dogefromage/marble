import { PayloadAction } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { panelStateBind, panelStateRemove } from "../../enhancers/panelStateEnhancer";
import { useAppDispatch } from "../../redux/hooks";
import { CreatePanelStateCallback, Obj, PanelState, Vec2, Rect } from "../../types";
import { ViewTypes } from "../../types/panelManager/views";

export function useBindPanelState(panelId: string, createPanelState: CreatePanelStateCallback, viewType: ViewTypes) {
    const dispatch = useAppDispatch();
    useEffect(() => {
        const panelState = createPanelState(panelId);
        dispatch(panelStateBind({ panelId, panelState, viewType }));
        return () => {
            dispatch(panelStateRemove({ panelId }))
        };
    }, [ panelId ]);
}

export function getPanelState<T extends PanelState>(s: Obj<T>, a: PayloadAction<{ panelId: string }>) {
    const ps = s[ a.payload.panelId ];
    if (!ps) return console.error(`Panel state not found panelId=${a.payload.panelId}`);
    return ps;
}

export function offsetToClientPos(clientRect: Rect, offsetPos: Vec2): Vec2 {
    return {
        x: offsetPos.x + clientRect.x,
        y: offsetPos.y + clientRect.y,
    }
}

export function clientToOffsetPos(clientRect: Rect, clientPos: Vec2): Vec2 {
    return {
        x: clientPos.x - clientRect.x,
        y: clientPos.y - clientRect.y,
    }
}