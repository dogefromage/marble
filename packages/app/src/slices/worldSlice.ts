import { createSlice } from "@reduxjs/toolkit";
import defaultUnitSystem from "../content/defaultUnitSystem";
import { selectProject } from "../redux/hooks";
import { RootState } from "../redux/store";
import { WorldSliceState } from "../types";

const initialState: WorldSliceState = 
{
    unitSystem: defaultUnitSystem,
};

export const worldSlice = createSlice({
    name: 'world',
    initialState,
    reducers: {}
});

// export const {
// } = worldSlice.actions;

export const selectWorld = (state: RootState) => selectProject(state).world;

const worldReducer = worldSlice.reducer;

export default worldReducer;
