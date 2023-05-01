import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { AppSliceState } from "../types";

const initialState: AppSliceState = {
    hasUserSaved: false,
    displayOpenFilePopup: 0,
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
        setOpenFilePopup: s => {
            s.displayOpenFilePopup++;
        }
    }
});

export const {
    setUserSaved: appSetUserSaved,
    loadProject: appLoadProject,
    setOpenFilePopup: appSetOpenFilePopup,
} = appSlice.actions;

export const selectApp = (state: RootState) => state.app;

const appReducer = appSlice.reducer;

export default appReducer;