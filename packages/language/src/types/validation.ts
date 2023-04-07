import { TypeTreePath } from "../validation/typeStructureValidation";
import { FunctionSignature } from "./signatures";
import { MapTypeSpecifier, TypeSpecifier } from "./typeSpecifiers";
import { Obj } from "./utils";

interface CyclicGraphs {
    type: 'cyclic-graphs';
    cycles: string[][];
}
export type ProgramProblem =
    | CyclicGraphs

export interface ProgramValidationResult {
    problems: ProgramProblem[];
    graphs: Obj<GraphValidationResult | undefined>;
}

interface CyclicNodes {
    type: 'cyclic-nodes';
    cycles: string[][];
}
interface MissingNode {
    type: 'missing-node';
    nodeId: string;
}
export type GraphProblem =
    | CyclicNodes
    | MissingNode

export interface GraphValidationResult {
    problems: GraphProblem[];
    nodes: Obj<NodeValidationResult | undefined>;
    signature: FunctionSignature;
}

interface MissingSignature {
    type: 'missing-signature';
    signature: string;
}
export type NodeProblem =
    | MissingSignature
    
export interface NodeValidationResult {
    problems: NodeProblem[];
    specifier: MapTypeSpecifier;
    rows: Obj<RowValidationResult | undefined>;
}

interface InvalidSignature {
    type: 'invalid-signature';
}
interface RequiredParameter {
    type: 'required-parameter';
}
interface IncompatibleType {
    type: 'incompatible-type';
    connectionIndex: number;
    typeProblemPath: TypeTreePath;
    typeProblemMessage: string;
}
export type RowProblem = 
    | InvalidSignature
    | RequiredParameter
    | IncompatibleType

export interface RowValidationResult {
    problems: RowProblem[];
    specifier: TypeSpecifier;
}
