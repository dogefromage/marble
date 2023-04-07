import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import panelStateEnhancer from "../enhancers/panelStateEnhancer";
import { CreatePanelStateCallback, FlowEditorPanelState, Obj, PlanarCamera, ViewTypes } from "../types";
import { clamp } from "../utils/math";
import { getPanelState } from "../utils/panelManager";
import { Vec2 } from "three";
import { pointScreenToWorld } from "../utils/geometries/planarCameraMath";
import { JointLocation } from "@marble/language";

export const CAMERA_MIN_ZOOM = 1e-2;
export const CAMERA_MAX_ZOOM = 1e+2;

export const createFlowEditorPanelState: CreatePanelStateCallback<FlowEditorPanelState> = () => {
    const panelState: FlowEditorPanelState = {
        viewType: ViewTypes.FlowEditor,
        flowStack: [],
        camera: { position: { x: 0, y: 0 }, zoom: 1, },
        selection: [],
        state: null,
    };
    return panelState;
}

export const flowEditorPanelsSlice = createSlice({
    name: 'flowEditorPanels',
    initialState: {} as Obj<FlowEditorPanelState>,
    reducers: {
        setFlowId: (s, a: PayloadAction<{ panelId: string, flowId: string }>) => {
            const ps = getPanelState(s, a);
            if (!ps) return;

            const geoId = a.payload.flowId;
            if (ps.flowStack.includes(geoId)) {
                while (ps.flowStack[0] != geoId && ps.flowStack.length > 0) {
                    ps.flowStack.shift();
                }
            } else {
                ps.flowStack = [geoId];
            }
        },
        pushFlowId: (s, a: PayloadAction<{ panelId: string, flowId: string }>) => {
            const ps = getPanelState(s, a);
            if (!ps) return;
            ps.flowStack.unshift(a.payload.flowId);
        },
        updateCamera: (s, a: PayloadAction<{ panelId: string, newCamera: Partial<PlanarCamera> }>) => {
            const ps = getPanelState(s, a);
            if (!ps) return;

            Object.assign(ps.camera, a.payload.newCamera);

            ps.camera.zoom = clamp(ps.camera.zoom, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
        },
        setStateNeutral: (s, a: PayloadAction<{ panelId: string }>) => {
            const ps = getPanelState(s, a);
            if (!ps) return;
            ps.state = null;
        },
        setStateAddNodeAtPosition: (s, a: PayloadAction<{ panelId: string, clientPosition: Vec2, offsetPosition: Vec2 }>) => {
            const ps = getPanelState(s, a);
            if (!ps) return;
            const worldPosition = pointScreenToWorld(ps.camera, a.payload.offsetPosition);
            ps.state = {
                type: 'add-node-at-position',
                location: {
                    clientPosition: a.payload.clientPosition,
                    worldPosition,
                },
            };
        },
        setStateDraggingLink: (s, a: PayloadAction<{ panelId: string, fromJoint: JointLocation }>) => {
            const ps = getPanelState(s, a);
            if (!ps) return;
            ps.state = {
                type: 'dragging-link',
                fromJoint: a.payload.fromJoint,
            };
        },
        setStateAddNodeWithConnection: (s, a: PayloadAction<{ panelId: string, clientPosition: Vec2, offsetPosition: Vec2 }>) => {
            const ps = getPanelState(s, a);
            if (!ps) return;
            const worldPosition = pointScreenToWorld(ps.camera, a.payload.offsetPosition);
            const lastState = ps.state;
            if (lastState?.type !== 'dragging-link') {
                return console.error(`Tried to add node with connection but last state was not draggin-link`);
            }
            ps.state = {
                type: 'add-node-with-connection',
                location: {
                    clientPosition: a.payload.clientPosition,
                    worldPosition,
                },
                fromJoint: lastState.fromJoint,
            };
        },
    }
});

export const {
    setFlowId: flowEditorPanelsSetFlowId,
    pushFlowId: flowEditorPanelsPushFlowId,
    updateCamera: flowEditorPanelsUpdateCamera,
    setStateNeutral: flowEditorSetStateNeutral,
    setStateAddNodeAtPosition: flowEditorSetStateAddNodeAtPosition,
    setStateDraggingLink: flowEditorSetStateDraggingLink,
    setStateAddNodeWithConnection: flowEditorSetStateAddNodeWithConnection,
} = flowEditorPanelsSlice.actions;

const flowEditorPanelsReducer = panelStateEnhancer(
    flowEditorPanelsSlice.reducer,
    ViewTypes.FlowEditor,
);

export default flowEditorPanelsReducer;