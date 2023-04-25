import { FlowSignatureId, InputRowSignature, OutputRowSignature } from "./signatures";
import { InitializerValue } from "./typeSpecifiers";
import { Obj, Vec2, Versionable } from "./utilTypes";

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


export interface FlowEntryPoint extends Versionable {
    entryFlowId: string;
}