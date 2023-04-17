import { FlowSignatureId, InputRowSignature, OutputRowSignature } from "./signatures";
import { Obj, Vec2, Versionable } from "./utils";

export type InitializerValue =
    | null
    | number 
    | boolean
    | readonly InitializerValue[]
    | { [key: string]: InitializerValue }

export interface InputJointLocation {
    direction: 'input';
    nodeId: string;
    rowId: string;
    jointIndex: number;
}
export interface OutputJointLocation {
    direction: 'output';
    nodeId: string;
    rowId: string;
}
export type JointLocation = InputJointLocation | OutputJointLocation

export interface OutputLocation {
    nodeId: string;
    outputId: string;
}

export interface RowState {
    connections: OutputLocation[];
    value: InitializerValue | null;
}

export interface FlowNode {
    id: string;
    name?: string;
    position: Vec2;
    rowStates: Obj<RowState>;
    signature: FlowSignatureId;
}

export interface FlowGraph extends Versionable {
    name: string;
    nodes: Obj<FlowNode>;
    inputs: InputRowSignature[];
    outputs: OutputRowSignature[];
    nextIdIndex: number;
}
