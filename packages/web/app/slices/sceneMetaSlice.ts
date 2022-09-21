import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { SceneMetaSliceState } from "./types/SliceStates";

const initialState: SceneMetaSliceState = 
{
    
};

export const sceneMetaStateSlice = createSlice({
    name: 'sceneMetaState',
    initialState,
    reducers: {

    }
});

export const {
    
} = sceneMetaStateSlice.actions;

export const select = (state: RootState) => state.sceneMetaState;

const sceneMetaStateReducer = sceneMetaStateSlice.reducer;

export default sceneMetaStateReducer;