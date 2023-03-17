import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { vec2, vec3 } from "gl-matrix";
import panelStateEnhancer from "../enhancers/panelStateEnhancer";
import { CreatePanelStateCallback, ObjMap, ViewportCamera, ViewportPanelState, ViewTypes } from "../types";
import { clamp, degToRad } from "../utils/math";
import { getPanelState } from "../utils/panelManager";

export const createViewportPanelState: CreatePanelStateCallback<ViewportPanelState> = () => {
    return {
        viewType: ViewTypes.Viewport,
        uniformSources: {
            viewportCamera: {
                target: [ 0, 0, 0 ],
                rotation: [ degToRad(-30), degToRad(40) ],
                distance: 15,
                fov: 15,
            },
            maxIterations: 200,
        }
    };
}

export const viewportPanelsSlice = createSlice({
    name: 'viewportPanels',
    initialState: {} as ObjMap<ViewportPanelState>,
    reducers: {
        editCamera: (s, a: PayloadAction<{ panelId: string, partialCamera: Partial<ViewportCamera> }>) => {
            const ps = getPanelState(s, a);
            if (!ps) return;

            const camera = ps.uniformSources.viewportCamera;

            Object.assign(camera, a.payload.partialCamera);

            const maxBeta = 0.5 * Math.PI;
            camera.rotation[ 0 ] = clamp(camera.rotation[ 0 ], -maxBeta, maxBeta);
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