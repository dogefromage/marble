import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import panelStateEnhancer from "../enhancers/panelStateEnhancer";
import { CreatePanelStateCallback, GeometryEditorPanelState, ObjMap, PlanarCamera, Point, ViewTypes } from "../types";
import { pointScreenToWorld } from "../utils/geometries/planarCameraMath";
import { p2v, v2p } from "../utils/linalg";
import { clamp } from "../utils/math";
import { getPanelState } from "../utils/panelManager";

export const CAMERA_MIN_ZOOM = 1e-2;
export const CAMERA_MAX_ZOOM = 1e+2;

export const createGeometryEditorPanelState: CreatePanelStateCallback<GeometryEditorPanelState> = () => 
{
    const panelState: GeometryEditorPanelState = {
        geometryStack: [],
        viewType: ViewTypes.GeometryEditor,
        camera: { position: { x: 0, y: 0 }, zoom: 1, },
        templateCatalog: null,
        newLink: null,
    };
    return panelState;
}

export const geometryEditorPanelsSlice = createSlice({
    name: 'geometryEditorPanels',
    initialState: {} as ObjMap<GeometryEditorPanelState>,
    reducers: {
        setGeometryId: (s, a: PayloadAction<{ panelId: string, geometryId: string }>) => {
            const ps = getPanelState(s, a);
            if (!ps) return;
            
            const geoId = a.payload.geometryId;
            if (ps.geometryStack.includes(geoId)) {
                while (ps.geometryStack[0] != geoId && ps.geometryStack.length > 0) {
                    ps.geometryStack.shift();
                }
            } else {
                ps.geometryStack = [ geoId ];
            }
        },
        pushGeometryId: (s, a: PayloadAction<{ panelId: string, geometryId: string }>) => {
            const ps = getPanelState(s, a);
            if (!ps) return;
            ps.geometryStack.unshift(a.payload.geometryId);
        },
        updateCamera: (s, a: PayloadAction<{ panelId: string, newCamera: Partial<PlanarCamera> }>) =>
        {
            const ps = getPanelState(s, a);
            if (!ps) return;

            Object.assign(ps.camera, a.payload.newCamera);

            ps.camera.zoom = clamp(ps.camera.zoom, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
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
        },
        setNewLink: (s, a: PayloadAction<{ panelId: string, newLink: GeometryEditorPanelState['newLink'] }>) =>
        {
            const ps = getPanelState(s, a);
            if (!ps) return;
            ps.newLink = a.payload.newLink;
        },
    }
});

export const {
    setGeometryId: geometryEditorPanelsSetGeometryId,
    pushGeometryId: geometryEditorPanelsPushGeometryId,
    updateCamera: geometryEditorPanelsUpdateCamera,
    openTemplateCatalog: geometryEditorPanelsOpenTemplateCatalog,
    closeTemplateCatalog: geometryEditorPanelsCloseTemplateCatalog,
    setNewLink: geometryEditorPanelsSetNewLink,
} = geometryEditorPanelsSlice.actions;

const geometryEditorPanelsReducer = panelStateEnhancer(
    geometryEditorPanelsSlice.reducer,
    ViewTypes.GeometryEditor,
);

export default geometryEditorPanelsReducer;