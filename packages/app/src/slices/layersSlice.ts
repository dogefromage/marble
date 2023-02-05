import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { LayersSliceState, UndoAction } from "../types";

const initialState: LayersSliceState = {};

export const layersSlice = createSlice({
    name: 'layers',
    initialState,
    reducers: {
        create: (s, a: UndoAction<{ id: string, rootGeometryId: string }>) => {
            if (s[a.payload.id] != null) {
                throw new Error(`Layer already exists`);
            }
            const count = Object.keys(s).length;
            s[a.payload.id] = {
                id: a.payload.id,
                name: 'New Layer',
                version: 0,
                index: count,
                rootGeometryId: a.payload.rootGeometryId,
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