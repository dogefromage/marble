import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { SceneProgram } from "../types";
import { SceneProgramSliceState } from "../types/SliceStates";

const initialState: SceneProgramSliceState = 
{
    program: null,
    textureVarLookupData: null,
};

export const sceneProgramSlice = createSlice({
    name: 'sceneProgram',
    initialState,
    reducers: {
        setProgram: (s, a: PayloadAction<{ program: SceneProgram | null }>) =>
        {
            s.program = a.payload.program;
        },
        setLookup: (s, a: PayloadAction<{ lookup: number[] | null }>) =>
        {
            s.textureVarLookupData = a.payload.lookup;
        },
    }
});

export const {
    setProgram: sceneProgramSetProgram,
    setLookup: sceneProgramSetLookup,
} = sceneProgramSlice.actions;

export const selectSceneProgram = (state: RootState) => state.sceneProgram;

const sceneProgramReducer = sceneProgramSlice.reducer;

export default sceneProgramReducer;