import { FunctionSignatureId, InputRowSignature, OutputRowSignature } from "./signatures";
import { Obj, Vector2, Versionable } from "./utils";

interface InputJointLocation {
    direction: 'input';
    nodeId: string;
    rowId: string;
    jointIndex: number;
}
interface OutputJointLocation {
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
    state: Obj<any>;
}

export interface FlowNode {
    id: string;
    name?: string;
    position: Vector2;
    rowStates: Obj<RowState>;
    signature: FunctionSignatureId;
    // type: 'instance' | 'syntax';
}

export interface FlowGraph extends Versionable {
    name: string;
    nodes: Obj<FlowNode>;
    inputs: InputRowSignature[];
    outputs: OutputRowSignature[];
    nextIdIndex: number;
}
