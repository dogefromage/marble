import { TypeSpecifier } from "./typeSpecifiers";
import { Versionable } from "./utils";

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

type SimpleInputRow = BaseRow<'input-simple'>;
type ListInputRow = BaseRow<'input-list'>;
interface NullableInputRow extends BaseRow<'input-nullable'> {
    defaultValue: any;
}

type SimpleOutputRow = BaseRow<'output'>;

export type InputRowSignature =
    | SimpleInputRow
    | ListInputRow
    | NullableInputRow

export type OutputRowSignature = 
    | SimpleOutputRow

export type FunctionSignatureSources = 'internal' | 'composed' | 'syntax';
export type FunctionSignatureId = `${FunctionSignatureSources}:${string}`

/**
 * Minimum data required to instantiate this function either internal, graph or other location.
 * Essentially template or outline of any node which can be used in graph.
 * 
 * Every flow function takes in a dictionary (parameter name -> value) and outputs a dictionary (output name -> value).
 * In the flow graph, parameter and output names match the corresponding rows id.
 * 
 * The order of inputs and outputs in the array should be only used for display.
 */
export interface FunctionSignature extends Versionable {
    id: FunctionSignatureId;
    name: string;
    inputs: InputRowSignature[];
    outputs: OutputRowSignature[];
}
