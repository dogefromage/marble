import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { LayerProgramsSliceState, LayerProgram } from "../types";

const initialState: LayerProgramsSliceState = {};

export const layerProgramsSlice = createSlice({
    name: 'layerPrograms',
    initialState,
    reducers: {
        setMany: (s, a: PayloadAction<{ setPrograms: LayerProgram[], removePrograms: string[] }>) => {
            for (const id of a.payload.removePrograms) {
                delete s[ id ];
            }
            for (const p of a.payload.setPrograms) {
                s[ p.id ] = p;
            }
        }
    }
});

export const {
    setMany: layerProgramsSetMany,
} = layerProgramsSlice.actions;

export const selectLayerPrograms = (state: RootState) => state.runtime.layerPrograms;

const layerProgramsReducer = layerProgramsSlice.reducer;

export default layerProgramsReducer;