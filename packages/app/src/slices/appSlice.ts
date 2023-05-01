import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { AppSliceState } from "../types";

const initialState: AppSliceState = {
    hasUserSaved: false,
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setUserSaved: (s, a: PayloadAction<{ val: boolean }>) => {
            s.hasUserSaved = a.payload.val;
        },
        loadProject: (s, a: PayloadAction<{ data: string | null }>) => {
            s.projectToLoad = {
                data: a.payload.data,
            };
        },
    }
});

export const {
    setUserSaved: appSetUserSaved,
    loadProject: appLoadProject,
} = appSlice.actions;

export const selectApp = (state: RootState) => state.app;

const appReducer = appSlice.reducer;

export default appReducer;