import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { castImmutable } from "immer";
import { useCallback } from "react";
import { RootState } from "../redux/store";
import { PanelManagerSliceState, Rect } from "../types";

const initialState: PanelManagerSliceState = {
    activePanelId: '',
    clientRects: new Map(),
};

export const PanelManagerSlice = createSlice({
    name: 'panelManager',
    initialState,
    reducers: {
        setActive: (s, a: PayloadAction<{ activePanel: string }>) => {
            s.activePanelId = a.payload.activePanel;
        },
        setClientRect: (s, a: PayloadAction<{ panelId: string, rect: Rect }>) => {
            s.clientRects.set(a.payload.panelId, a.payload.rect);
        },
    }
});

export const {
    setActive: panelManagerSetActive,
    setClientRect: panelManagerSetClientRect,
} = PanelManagerSlice.actions;

export const selectPanelManager = (state: RootState) => state.editor.panelManager;

export const selectPanelClientRect = 
    (panelId: string) =>
        useCallback((state: RootState) => 
            state.editor.panelManager.clientRects.get(panelId), 
            [ panelId ]
        );

const panelManagerReducer = PanelManagerSlice.reducer;

export default panelManagerReducer;