import { FlowEnvironment } from './environments';
import {
    FlowGraph,
    FlowNode,
    InitializerValue,
    InputJointLocation,
    OutputJointLocation,
    RowState
    } from './state';
import { FlowSignature } from './signatures';
import { MapTypeSpecifier, TypeSpecifier } from './typeSpecifiers';
import { Obj } from './utils';

export type EdgeColor = 'normal' | 'redundant' | 'cyclic';

export interface FlowEdge {
    id: string;
    source: OutputJointLocation;
    target: InputJointLocation;
    color: EdgeColor;
}

export interface ProjectContext {
    ref: Obj<FlowGraph>;
    problems: ProjectProblem[];
    flowContexts: Obj<FlowGraphContext>;
    topologicalFlowOrder: string[];
}

export interface FlowGraphContext {
    ref: FlowGraph;
    problems: FlowProblem[];
    nodeContexts: Obj<FlowNodeContext>;
    edges: Obj<FlowEdge>;
    flowSignature: FlowSignature;
    flowEnvironment: FlowEnvironment;
    dependencies: string[];
    dependants: string[];
    topologicalNodeOrder: string[];
}

export interface FlowNodeContext {
    ref: FlowNode;
    problems: NodeProblem[];
    rowContexts: Obj<RowContext>;
    templateSignature: FlowSignature | null;
    outputSpecifier: MapTypeSpecifier | null;
}

export interface RowContext {
    ref?: RowState;
    displayValue?: InitializerValue;
    problems: RowProblem[];
    specifier: TypeSpecifier;
}


interface CyclicFlows {
    type: 'cyclic-flows';
    cycles: string[][];
}
export type ProjectProblem =
    | CyclicFlows

interface CyclicNodes {
    type: 'cyclic-nodes';
    cycles: string[][];
}
interface MissingNode {
    type: 'missing-node';
    nodeId: string;
}
interface OutputMissing {
    type: 'output-missing';
}
export type FlowProblem =
    | CyclicNodes
    | MissingNode
    | OutputMissing

interface MissingSignature {
    type: 'missing-signature';
    signature: string;
}
export type NodeProblem =
    | MissingSignature
    
interface InvalidSignature {
    type: 'invalid-signature';
}
interface RequiredParameter {
    type: 'required-parameter';
}
interface IncompatibleType {
    type: 'incompatible-type';
    connectionIndex: number;
    typeProblemPath: string[];
    typeProblemMessage: string;
}
export type RowProblem = 
    | InvalidSignature
    | RequiredParameter
    | IncompatibleType
