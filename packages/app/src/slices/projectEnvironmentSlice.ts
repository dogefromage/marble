import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { initialEnvironment } from "../types/flows/setup";
import { FlowEnvironmentContent } from "@marble/language";

const initialState: FlowEnvironmentContent = initialEnvironment;

export const projectEnvironmentSlice = createSlice({
    name: 'projectEnvironment',
    initialState,
    reducers: {}
});

export const {
} = projectEnvironmentSlice.actions;

export const selectProjectEnvironment = (state: RootState) => state.projectEnvironment;

const projectEnvironmentReducer = projectEnvironmentSlice.reducer;

export default projectEnvironmentReducer;