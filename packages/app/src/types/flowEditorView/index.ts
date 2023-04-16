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

interface NeutralState {
    type: 'neutral';
}
interface AddNodeAtPositionState {
    type: 'add-node-at-position';
    location: FlowEditorActionLocation;
}
interface DraggingLinkState {
    type: 'dragging-link';
    fromJoint: JointLocation;
    cursorWorldPosition: Vec2 | null;
}
interface AddNodeWithConnectionState {
    type: 'add-node-with-connection';
    location: FlowEditorActionLocation;
    fromJoint: JointLocation;
}

export type FlowEditorActionState =
    | NeutralState
    | AddNodeAtPositionState
    | DraggingLinkState
    | AddNodeWithConnectionState

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