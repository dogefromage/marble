import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { LayersSliceState, UndoAction } from "../types";
import { DEFAULT_LAYER_ID, initialDefaultLayer } from "../types/flows/setup";

const initialState: LayersSliceState = {
    [DEFAULT_LAYER_ID]: initialDefaultLayer,
};

export const layersSlice = createSlice({
    name: 'layers',
    initialState,
    reducers: {
        create: (s, a: UndoAction<{ id: string, entryFlowId: string }>) => {
            if (s[a.payload.id] != null) {
                throw new Error(`Layer already exists`);
            }
            const count = Object.keys(s).length;
            s[a.payload.id] = {
                id: a.payload.id,
                name: 'New Layer',
                // version: 0,
                drawIndex: count,
                entryFlowId: a.payload.entryFlowId,
            };
        },
    },
});

export const {
    create: layersCreate,
} = layersSlice.actions;

export const selectLayers = (state: RootState) => state.recorded.present.project.layers;

const layersReducer = layersSlice.reducer;

export default layersReducer;