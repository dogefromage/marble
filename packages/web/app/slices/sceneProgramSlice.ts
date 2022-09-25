import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { SceneProgramTree } from "../types";
import { SceneProgramSliceState } from "../types/SliceStates";

const initialState: SceneProgramSliceState = 
{
    program: null,
};

export const sceneProgramSlice = createSlice({
    name: 'sceneProgram',
    initialState,
    reducers: {
        setProgram: (s, a: PayloadAction<{ program: SceneProgramTree | null }>) =>
        {
            s.program = a.payload.program;
        }
    }
});

export const {
    setProgram: sceneProgramSetProgram,
} = sceneProgramSlice.actions;

export const select = (state: RootState) => state.sceneProgram;

const sceneProgramReducer = sceneProgramSlice.reducer;

export default sceneProgramReducer;