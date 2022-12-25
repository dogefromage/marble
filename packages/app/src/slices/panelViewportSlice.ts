import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { vec2, vec3 } from "gl-matrix";
import panelStateEnhancer from "../enhancers/panelStateEnhancer";
import { CreatePanelStateCallback, ObjMap, ViewportCamera, ViewportPanelState, ViewTypes } from "../types";
import { clamp, degToRad } from "../utils/math";
import getPanelState from "../utils/panelState/getPanelState";

export const createViewportPanelState: CreatePanelStateCallback<ViewportPanelState> = () => 
{
    return {
        viewType: ViewTypes.Viewport,
        uniformSources: {
            viewportCamera: {
                target: vec3.fromValues(0, 0, 0),
                rotation: vec2.fromValues(-30, 40),
                distance: 15,
                fov: degToRad(30),
            },
            maxIterations: 500,
        }
    };
}

export const viewportPanelsSlice = createSlice({
    name: 'viewportPanels',
    initialState: {} as ObjMap<ViewportPanelState>,
    reducers: {
        editCamera: (s, a: PayloadAction<{ panelId: string, partialCamera: Partial<ViewportCamera> }>) =>
        {
            const ps = getPanelState(s, a);
            if (!ps) return;

            const camera = ps.uniformSources.viewportCamera;

            Object.assign(camera, a.payload.partialCamera);

            camera.rotation[0] = clamp(camera.rotation[0], -90, 90);
            camera.distance = clamp(camera.distance, 1e-4, 1e6);
        },
    }
});

export const {
    editCamera: viewportPanelEditCamera,
} = viewportPanelsSlice.actions;

const viewportPanelsReducer = panelStateEnhancer(
    viewportPanelsSlice.reducer,
    ViewTypes.Viewport,
);

export default viewportPanelsReducer;