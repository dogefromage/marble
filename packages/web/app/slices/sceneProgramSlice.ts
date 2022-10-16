import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LOOKUP_TEXTURE_SIZE } from "../classes/ViewportQuadProgram";
import { RootState } from "../redux/store";
import { SceneProgram } from "../types";
import { SceneProgramSliceState } from "../types/SliceStates";

const initialState: SceneProgramSliceState = 
{
    program: null,
    textureVarLookupData: new Array(LOOKUP_TEXTURE_SIZE * LOOKUP_TEXTURE_SIZE).fill(0),
    // textureVarLookupData: new Float32Array(LOOKUP_TEXTURE_SIZE * LOOKUP_TEXTURE_SIZE),
};

export const sceneProgramSlice = createSlice({
    name: 'sceneProgram',
    initialState,
    reducers: {
        setProgram: (s, a: PayloadAction<{ program: SceneProgram | null }>) =>
        {
            s.program = a.payload.program;
        },
        setLookupSubarray: (s, a: PayloadAction<{ startCoordinate: number, subArray: number[] }>) =>
        {
            for (let i = 0; i < a.payload.subArray.length; i++)
            {
                s.textureVarLookupData[a.payload.startCoordinate + i] = a.payload.subArray[i];
            }
        },
    }
});

export const {
    setProgram: sceneProgramSetProgram,
    setLookupSubarray: sceneProgramSetLookupSubarray,
} = sceneProgramSlice.actions;

export const selectSceneProgram = (state: RootState) => state.sceneProgram;

const sceneProgramReducer = sceneProgramSlice.reducer;

export default sceneProgramReducer;