import { TypeSpecifier } from "./typeSpecifiers";
import { Obj, Versionable } from "./utils";

/**
 * Rows are either inputs or outputs of node.
 * The signature defines the shape or display 
 * of a row but not its state or connections.
 */
interface BaseRow<R extends string> {
    id: string;
    label: string;
    dataType: TypeSpecifier;
    rowType: R;
}

export type SimpleInputRowSignature = BaseRow<'input-simple'>;
export type VariableInputRowSignature = BaseRow<'input-variable'>;
export type ListInputRowSignature = BaseRow<'input-list'>;

export type SimpleOutputRowSignature = BaseRow<'output'>;

export type InputRowSignature =
    | SimpleInputRowSignature
    | ListInputRowSignature
    | VariableInputRowSignature
    
export type OutputRowSignature =
    | SimpleOutputRowSignature

export const inputRowTypes: InputRowSignature['rowType'][] = ['input-simple', 'input-variable', 'input-list'];
export const outputRowTypes: OutputRowSignature['rowType'][] = ['output'];

export type FunctionSignatureSources = 'internal' | 'composed' | 'syntax';
export type FlowSignatureId = `${FunctionSignatureSources}:${string}`

/**
 * Minimum data required to instantiate this function either internal, graph or other location.
 * Essentially template or outline of any node which can be used in graph.
 * 
 * Every flow function takes in a dictionary (parameter name -> value) and outputs a dictionary (output name -> value).
 * In the flow graph, parameter and output names match the corresponding rows id.
 * 
 * The order of inputs and outputs in the array should be only used for display.
 */

export interface AnonymousFlowSignature {
    inputs: InputRowSignature[];
    outputs: OutputRowSignature[];
}

export interface FlowSignature extends Versionable, AnonymousFlowSignature {
    id: FlowSignatureId;
    name: string;
    description: string | null;
    attributes: Obj<string>;
}
