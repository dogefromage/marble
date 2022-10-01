import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { quat, vec3 } from "gl-matrix";
import panelStateEnhancer from "../enhancers/panelStateEnhancer";
import { RootState } from "../redux/store";
import { CreatePanelStateCallback, ViewportPanelsSliceState, ViewTypes } from "../types";
import { degToRad } from "../utils/math";

export const createViewportPanelState: CreatePanelStateCallback = 
    () => 
{
    return {
        // Blender default cube camera
        camera: {
            position: vec3.fromValues(7.358, -6.925, 4.958),
            rotation: quat.fromValues(0.483536, 0.208704, 0.336872, 0.780483),
            fov: degToRad(25),
        },
    };
}

const initialState: ViewportPanelsSliceState = {};

export const viewportPanelsSlice = createSlice({
    name: 'viewportPanel',
    initialState,
    reducers: {}
});

// export const {
// } = viewportPanelsSlice.actions;

export const selectViewportPanels = (state: RootState) => state.editor.panels.viewport;

const viewportPanelsReducer = panelStateEnhancer(
    viewportPanelsSlice.reducer,
    ViewTypes.Viewport,
);

export default viewportPanelsReducer;