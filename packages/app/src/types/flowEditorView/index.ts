import { FlowEnvironment, JointLocation, TypeSpecifier } from "@marble/language";
import { Vec2 } from "../UtilityTypes";
import { PanelState } from "../panelManager";

export interface PlanarCamera {
    position: Vec2;
    zoom: number;
}

// interface TemplateCatalogState {
//     menuAnchor: Point;
//     worldPosition: Point;
// }

// export interface GeometryNewLink {
//     location: GeometryJointLocation;
//     direction: GeometryJointDirection;
//     dataType: DataTypes;
//     offsetPos: Point;
// }

interface FlowEditorActionLocation {
    worldPosition: Vec2;
    clientPosition: Vec2;
}
export interface DraggingJointContext {
    fromJoint: JointLocation;
    dataType: TypeSpecifier;
    environment: FlowEnvironment;
}

export interface FlowEditorNeutralState {
    type: 'neutral';
}
export interface FlowEditorAddNodeAtPositionState {
    type: 'add-node-at-position';
    location: FlowEditorActionLocation;
}
export interface FlowEditorDraggingLinkState {
    type: 'dragging-link';
    cursorWorldPosition: Vec2 | null;
    draggingContext: DraggingJointContext;
}
export interface FlowEditorAddNodeWithConnectionState {
    type: 'add-node-with-connection';
    location: FlowEditorActionLocation;
    draggingContext: DraggingJointContext;
}

export type FlowEditorActionState =
    | FlowEditorNeutralState
    | FlowEditorAddNodeAtPositionState
    | FlowEditorDraggingLinkState
    | FlowEditorAddNodeWithConnectionState

export type JointLocationKey = `${string}.${string}.${number}` | `${string}.${string}`;

export interface FlowEditorPanelState extends PanelState {
    // persistent
    flowStack: string[];
    camera: PlanarCamera;
    selection: string[];
    // volatile
    state: FlowEditorActionState;
    relativeJointPosition: Map<JointLocationKey, Vec2>;
}