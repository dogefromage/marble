import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { ProgramsSliceState, LayerProgram } from "../types";

const initialState: ProgramsSliceState = {};

export const programsSlice = createSlice({
    name: 'programs',
    initialState,
    reducers: {
        setMany: (s, a: PayloadAction<{ setPrograms: LayerProgram[], removePrograms: string[] }>) => {
            for (const id of a.payload.removePrograms) {
                delete s[id];
            }
            for (const p of a.payload.setPrograms) {
                s[p.id] = p;
            }
        }
    }
});

export const {
    setMany: programsSetMany,
} = programsSlice.actions;

export const selectPrograms = (state: RootState) => state.programs;

const programsReducer = programsSlice.reducer;

export default programsReducer;