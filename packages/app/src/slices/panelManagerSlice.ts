import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { ActivePanel, PanelManagerSliceState } from "../types";

const initialState: PanelManagerSliceState = {};

export const PanelManagerSlice = createSlice({
    name: 'panelManager',
    initialState,
    reducers: {
        setActive: (s, a: PayloadAction<{ activePanel: ActivePanel }>) => {
            s.activePanel = a.payload.activePanel;
        }
    }
});

export const {
    setActive: panelManagerSetActive,
} = PanelManagerSlice.actions;

export const selectPanelManager = (state: RootState) => state.editor.panelManager;

const panelManagerReducer = PanelManagerSlice.reducer;

export default panelManagerReducer;