import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { ProgramsSliceState, RenderLayerProgram } from "../types";

const initialState: ProgramsSliceState = {};

export const programsSlice = createSlice({
    name: 'programs',
    initialState,
    reducers: {
        setPrograms: (s, a: PayloadAction<{ programs: RenderLayerProgram[] }>) => {
            for (const p of a.payload.programs) {
                s[p.id] = p;
            }
        }
    }
});

export const {
    setPrograms: programsSliceSetPrograms,
} = programsSlice.actions;

export const selectPrograms = (state: RootState) => state.programs;

const programsReducer = programsSlice.reducer;

export default programsReducer;