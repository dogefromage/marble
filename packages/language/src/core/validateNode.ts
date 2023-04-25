import { FlowEnvironment, FlowNode, FlowSignature, InitializerValue, InputRowSignature, MapTypeSpecifier, OutputRowSignature, RowState, TypeSpecifier } from "../types";
import { FlowNodeContext, RowContext, RowProblem } from "../types/context";
import { Obj } from "../types/utilTypes";
import { deepFreeze, wrapDefined } from "../utils";
import { GraphTypeException } from "./typeStructure";
import { generateDefaultValue } from "./generateDefaultValue";
import { validateValue } from "./validateValue";
import { compareTypes } from "./compareTypes";

export function validateNode(
    node: FlowNode,
    environment: FlowEnvironment,
    earlierNodeOutputTypes: Map<string, MapTypeSpecifier>
): FlowNodeContext {
    const templateSignature = environment.getSignature(node.signature);
    if (templateSignature == null) {
        return {
            ref: node,
            problems: [{
                type: 'missing-signature',
                signature: node.signature,
            }],
            outputSpecifier: null,
            templateSignature: null,
            rowContexts: {},
            isRedundant: false,
        };
    }
    const outputSpecifier = signatureRowsToMapType(templateSignature.outputs);
    const rowContexts = validateNodeInputs(node.rowStates, templateSignature.inputs, earlierNodeOutputTypes, environment);

    const result: FlowNodeContext = {
        ref: node,
        problems: [],
        templateSignature,
        outputSpecifier,
        rowContexts,
        isRedundant: false,
    };
    deepFreeze(result);
    return result;
}

function signatureRowsToMapType<S extends InputRowSignature | OutputRowSignature>(rows: S[]): MapTypeSpecifier {
    const rowTypes: Obj<TypeSpecifier> = {};
    for (const row of rows) {
        rowTypes[row.id] = row.dataType;
    }
    return {
        type: 'map',
        elements: rowTypes,
    };
}

function validateNodeInputs(
    rowStates: FlowNode['rowStates'],
    inputRowSigs: FlowSignature['inputs'],
    earlierNodeOutputTypes: Map<string, MapTypeSpecifier>,
    environment: FlowEnvironment
): Obj<RowContext> {
    const rowResults: Obj<RowContext> = {};

    for (const input of inputRowSigs) {
        const rowState = rowStates[input.id] as RowState | undefined;
        // each node input receives a list of connections to support list inputs
        const connectedTypes: TypeSpecifier[] = rowState?.connections.map(conn => {
            const sourceOutput = earlierNodeOutputTypes.get(conn.nodeId);
            const rowOutputType = sourceOutput?.elements[conn.outputId];
            if (!rowOutputType) {
                return { type: 'unknown' };
            }
            return rowOutputType;
        }) || [];

        const rowResult = validateRowInput(input, rowState, connectedTypes, environment);
        deepFreeze(rowResult);
        rowResults[input.id] = rowResult;
    }

    return rowResults;
}
function validateRowInput(
    input: InputRowSignature,
    rowState: RowState | undefined,
    connectedTypeList: TypeSpecifier[],
    environment: FlowEnvironment
): RowContext {
    const expectedType = input.dataType;
    const result: RowContext = {
        ref: rowState,
        problems: [],
        specifier: expectedType,
    };

    if (input.rowType === 'input-list') {
        if (expectedType.type !== 'list') {
            result.problems.push({ type: 'invalid-signature' });
            return result;
        }
        for (let i = 0; i < connectedTypeList.length; i++) {
            const listItemProblem = compareParameterToExpected(connectedTypeList[i], expectedType.elementType, i, environment);
            if (listItemProblem) {
                result.problems.push(listItemProblem);
            }
        }
        return result;
    }
    const [connectedType] = connectedTypeList;

    if (input.rowType === 'input-simple') {
        if (connectedType == null) {
            result.problems.push({ type: 'required-parameter' });
            return result;
        }
        const problems = wrapDefined(compareParameterToExpected(connectedType, expectedType, 0, environment));
        result.problems.push(...problems);
        return result;
    }
    if (input.rowType === 'input-variable') {
        if (connectedType == null) {
            let displayValue: InitializerValue | undefined = rowState?.value ?? input.defaultValue;

            if (displayValue != null) {
                try {
                    validateValue(expectedType, displayValue, environment);
                } catch (e) {
                    if (e instanceof GraphTypeException) {
                        result.problems.push({
                            type: 'invalid-value',
                            typeProblemMessage: e.message,
                            typeProblemPath: e.path.toArray(),
                        });
                        displayValue = undefined;
                    } else {
                        throw e;
                    }
                }
            }
            const generatedDefault = generateDefaultValue(expectedType, environment);
            result.displayValue = displayValue ?? generatedDefault;
            return result; // show displayValue
        }
        const problems = wrapDefined(compareParameterToExpected(connectedType, expectedType, 0, environment));
        result.problems.push(...problems);
        return result;
    }

    throw new Error(`Unknown type ${(input as any).rowType}`);
}
function compareParameterToExpected(
    param: TypeSpecifier,
    expected: TypeSpecifier,
    connectionIndex: number,
    environment: FlowEnvironment
): RowProblem | undefined {
    try {
        compareTypes(param, expected, environment);
    } catch (e) {
        if (e instanceof GraphTypeException) {
            return {
                type: 'incompatible-type',
                connectionIndex,
                typeProblemMessage: e.message,
                typeProblemPath: e.path.toArray(),
            };
        }
        throw e;
    }
}
