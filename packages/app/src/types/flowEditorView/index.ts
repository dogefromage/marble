import { JointLocation } from "@marble/language";
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

interface AddNodeAtPositionState {
    type: 'add-node-at-position';
    location: FlowEditorActionLocation;
}
interface DraggingLinkState {
    type: 'dragging-link';
    fromJoint: JointLocation;
}
interface AddNodeWithConnectionState {
    type: 'add-node-with-connection';
    location: FlowEditorActionLocation;
    fromJoint: JointLocation;
}

export type FlowEditorActionState =
    | AddNodeAtPositionState
    | DraggingLinkState
    | AddNodeWithConnectionState

export interface FlowEditorPanelState extends PanelState {
    flowStack: string[];
    camera: PlanarCamera;
    selection: string[];
    state: FlowEditorActionState | null;
}