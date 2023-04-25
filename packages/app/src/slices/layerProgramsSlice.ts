import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { Layer, LayerProgram, LayerProgramsSliceState, Obj } from "../types";

const initialState: LayerProgramsSliceState = {};

export const layerProgramsSlice = createSlice({
    name: 'layerPrograms',
    initialState,
    reducers: {
        setMany: (s, a: PayloadAction<{ setPrograms: LayerProgram[], removePrograms: string[] }>) => {
            for (const id of a.payload.removePrograms) {
                delete s[id];
            }
            for (const p of a.payload.setPrograms) {
                s[p.id] = p;
            }
        },
        setRows: (s, a: PayloadAction<{ rowMap: Obj<number[]> }>) => {
            // for (const [ layerId, row ] of Object.entries(a.payload.rowMap)) {
            //     if (s[layerId] != null) {
            //         s[layerId]!.textureVarRow = row;
            //     }
            // }
        }
    }
});

export const {
    setMany: layerProgramsSetMany,
    setRows: layerProgramsSetRows,
} = layerProgramsSlice.actions;

export const selectLayerPrograms = (state: RootState) => state.recorded.present.layerPrograms;

const layerProgramsReducer = layerProgramsSlice.reducer;

export default layerProgramsReducer;