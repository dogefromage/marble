import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { PanelManagerSliceState } from "../types";

const initialState: PanelManagerSliceState = {};

export const PanelManagerSlice = createSlice({
    name: 'panelManager',
    initialState,
    reducers: {
        setActive: (s, a: PayloadAction<{ activeId: string }>) =>
        {
            s.activePanel = a.payload.activeId;
        }
    }
});

export const {
    setActive: panelManagerSetActive,
} = PanelManagerSlice.actions;

export const selectPanelManager = (state: RootState) => state.editor.panelManager;

const panelManagerReducer = PanelManagerSlice.reducer;

export default panelManagerReducer;