import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { ContextMenuState, ContextMenuSliceState } from "../types";

const initialState: ContextMenuSliceState = 
{
    active: null,
};

export const contextMenuSlice = createSlice({
    name: 'contextMenu',
    initialState,
    reducers: {
        open: (s, a: PayloadAction<{ active: ContextMenuState }>) =>
        {
            s.active = a.payload.active;
        },
        close: s =>
        {
            s.active = null;
        }
    }
});

export const {
    open: contextMenuOpen,
    close: contextMenuClose,
} = contextMenuSlice.actions;

export const selectContextMenu = (state: RootState) => state.runtime.contextMenu;

const contextMenuReducer = contextMenuSlice.reducer;

export default contextMenuReducer;