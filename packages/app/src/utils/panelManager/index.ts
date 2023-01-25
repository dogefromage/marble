import { PayloadAction } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { panelStateBind, panelStateRemove } from "../../enhancers/panelStateEnhancer";
import { useAppDispatch } from "../../redux/hooks";
import { CreatePanelStateCallback, PanelState, ObjMap } from "../../types";
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

export function getPanelState<T extends PanelState>(s: ObjMap<T>, a: PayloadAction<{ panelId: string }>) {
    const ps = s[ a.payload.panelId ];
    if (!ps) return console.error(`Panel state not found panelId=${a.payload.panelId}`);
    return ps;
}