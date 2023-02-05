import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { PreferencesSliceState } from "../types";

const initialState: PreferencesSliceState = {};

export const preferencesSlice = createSlice({
    name: 'preferences',
    initialState,
    reducers: {}
});

// export const {
// } = preferencesSlice.actions;

// export const selectPreferences = (state: RootState) => state.editor.preferences;

const preferencesReducer = preferencesSlice.reducer;

export default preferencesReducer;