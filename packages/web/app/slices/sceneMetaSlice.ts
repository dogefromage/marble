import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { SceneProgramSliceState } from "./types/SliceStates";

const initialState: SceneProgramSliceState = 
{
    
};

export const sceneProgramSlice = createSlice({
    name: 'sceneProgram',
    initialState,
    reducers: {

    }
});

export const {
    
} = sceneProgramSlice.actions;

export const select = (state: RootState) => state.sceneProgram;

const sceneProgramReducer = sceneProgramSlice.reducer;

export default sceneProgramReducer;