import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { vec2, vec3 } from "gl-matrix";
import panelStateEnhancer from "../enhancers/panelStateEnhancer";
import { CreatePanelStateCallback, Obj, ViewportCamera, ViewportPanelState, ViewTypes } from "../types";
import { clamp, degToRad } from "../utils/math";
import { getPanelState } from "../utils/panelManager";

export const defaultViewportCamera: ViewportCamera = {
    target: [ 0, 0, 0 ],
    rotation: [ degToRad(-30), degToRad(40) ],
    distance: 25,
    fov: 15,
};

export const createViewportPanelState: CreatePanelStateCallback<ViewportPanelState> = () => {
    return {
        viewType: ViewTypes.Viewport,
        viewportCamera: defaultViewportCamera,
        maxIterations: 200,
    };
}

export const viewportPanelsSlice = createSlice({
    name: 'viewportPanels',
    initialState: {} as Obj<ViewportPanelState>,
    reducers: {
        editCamera: (s, a: PayloadAction<{ panelId: string, partialCamera: Partial<ViewportCamera> }>) => {
            const ps = getPanelState(s, a);
            if (!ps) return;

            ps.viewportCamera = {
                ...ps.viewportCamera,
                ...structuredClone(a.payload.partialCamera),
            };

            const maxBeta = 0.5 * Math.PI;
            ps.viewportCamera.rotation[ 0 ] = clamp(ps.viewportCamera.rotation[ 0 ], -maxBeta, maxBeta);
            ps.viewportCamera.distance = clamp(ps.viewportCamera.distance, 1e-4, 1e6);
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