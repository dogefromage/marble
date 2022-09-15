import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { quat, vec3 } from "gl-matrix";
import { RootState } from "../redux/store";
import { degToRad } from "../utils/math";
import { ViewportPanelsSliceState } from "./types/SliceStates";

function createDefaultState()
{
    return {
        // Blender default cube camera
        camera: {
            position: vec3.fromValues(7.358, -6.925, 4.958),
            rotation: quat.fromValues(0.483536, 0.208704, 0.336872, 0.780483),
            fov: degToRad(40),
        },
    };
}

const initialState: ViewportPanelsSliceState = {};

export const viewportPanelsSlice = createSlice({
    name: 'viewportPanel',
    initialState,
    reducers: {
        createPanelState: (s, a: PayloadAction<{ panelId: string }>) =>
        {
            s[a.payload.panelId] = createDefaultState();
        },
        removePanelState: (s, a: PayloadAction<{ panelId: string }>) =>
        {
            delete s[a.payload.panelId];
        },
    }
});

export const {
    createPanelState: viewportPanelsCreatePanelState,
    removePanelState: viewportPanelsRemovePanelState,
} = viewportPanelsSlice.actions;

export const selectViewportPanels = (state: RootState) => state.editor.panels.viewport;

const viewportPanelsReducer = viewportPanelsSlice.reducer;

export default viewportPanelsReducer;