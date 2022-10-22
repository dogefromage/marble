import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import panelStateEnhancer from "../enhancers/panelStateEnhancer";
import { RootState } from "../redux/store";
import { CreatePanelStateCallback, GeometryEditorPanelState, ObjMap, PlanarCamera, ViewTypes } from "../types";
import getPanelState from "../utils/panelState/getPanelState";

export const CAMERA_MIN_ZOOM = 1e-2;
export const CAMERA_MAX_ZOOM = 1e+2;

export const createGeometryEditorPanelState: CreatePanelStateCallback<GeometryEditorPanelState> = () => 
{
    return {
        camera: {
            position: { x: 0, y: 0 },
            zoom: 1,
        }
    };
}

export const geometryEditorPanelsSlice = createSlice({
    name: 'geometryEditorPanels',
    initialState: {} as ObjMap<GeometryEditorPanelState>,
    reducers: {
        editCamera: (s, a: PayloadAction<{ panelId: string, partialCamera: Partial<PlanarCamera> }>) =>
        {
            const ps = getPanelState(s, a);
            if (!ps) return;

            Object.assign(ps.camera, a.payload.partialCamera);

            // camera.rotation[0] = clamp(camera.rotation[0], -90, 90);
            // camera.distance = clamp(camera.distance, 1e-4, 1e6);
        },
    }
});

export const {
    editCamera: geometryEditorPanelsEditCamera,
} = geometryEditorPanelsSlice.actions;

export const selectGeometryEditorPanels = (state: RootState) => state.editor.panels[ViewTypes.GeometryEditor];

const geometryEditorPanelsReducer = panelStateEnhancer(
    geometryEditorPanelsSlice.reducer,
    ViewTypes.GeometryEditor,
);

export default geometryEditorPanelsReducer;