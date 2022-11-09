import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { vec2 } from "gl-matrix";
import panelStateEnhancer from "../enhancers/panelStateEnhancer";
import { RootState } from "../redux/store";
import { CreatePanelStateCallback, GeometryEditorPanelState, ObjMap, PlanarCamera, Point, ViewTypes } from "../types";
import { pointScreenToWorld } from "../utils/geometries/planarCameraMath";
import { clamp } from "../utils/math";
import getPanelState from "../utils/panelState/getPanelState";
import { p2v, v2p } from "../utils/linalg";

export const CAMERA_MIN_ZOOM = 1e-2;
export const CAMERA_MAX_ZOOM = 1e+2;

export const createGeometryEditorPanelState: CreatePanelStateCallback<GeometryEditorPanelState> = () => 
{
    return {
        viewType: ViewTypes.GeometryEditor,
        camera: {
            position: { x: 0, y: 0 },
            zoom: 1,
        },
        templateCatalog: null,
    };
}

export const geometryEditorPanelsSlice = createSlice({
    name: 'geometryEditorPanels',
    initialState: {} as ObjMap<GeometryEditorPanelState>,
    reducers: {
        setGeometryId: (s, a: PayloadAction<{ panelId: string, geometryId: string }>) =>
        {
            const ps = getPanelState(s, a);
            if (!ps) return;
            ps.geometryId = a.payload.geometryId;
        },
        editCamera: (s, a: PayloadAction<{ panelId: string, partialCamera: Partial<PlanarCamera> }>) =>
        {
            const ps = getPanelState(s, a);
            if (!ps) return;

            Object.assign(ps.camera, a.payload.partialCamera);

            ps.camera.zoom = clamp(ps.camera.zoom, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
        },
        setActiveNode: (s, a: PayloadAction<{ panelId: string, nodeId?: string }>) =>
        {
            const ps = getPanelState(s, a);
            if (!ps) return;
            ps.activeNode = a.payload.nodeId;
        },
        openTemplateCatalog: (s, a: PayloadAction<{ panelId: string, offsetPos: Point, center: boolean }>) =>
        {
            const ps = getPanelState(s, a);
            if (!ps) return;

            const worldPosition = pointScreenToWorld(ps.camera, p2v(a.payload.offsetPos));

            ps.templateCatalog = {
                offsetPosition: a.payload.offsetPos,
                worldPosition: v2p(worldPosition),
                center: a.payload.center,
            };
        },
        closeTemplateCatalog: (s, a: PayloadAction<{ panelId: string }>) =>
        {
            const ps = getPanelState(s, a);
            if (!ps) return;
            ps.templateCatalog = null;
        }
    }
});

export const {
    editCamera: geometryEditorPanelsEditCamera,
    setActiveNode: geometryEditorSetActiveNode,
    setGeometryId: geometryEditorSetGeometryId,
    openTemplateCatalog: geometryEditorPanelOpenTemplateCatalog,
    closeTemplateCatalog: geometryEditorPanelCloseTemplateCatalog,
} = geometryEditorPanelsSlice.actions;

export const selectGeometryEditorPanels = (state: RootState) => state.editor.panels[ViewTypes.GeometryEditor];

const geometryEditorPanelsReducer = panelStateEnhancer(
    geometryEditorPanelsSlice.reducer,
    ViewTypes.GeometryEditor,
);

export default geometryEditorPanelsReducer;