import { FlowEnvironment, FlowNode, FlowSignature, InitializerValue, InputRowSignature, MapTypeSpecifier, RowState, TypeSpecifier } from "../types";
import { FlowNodeContext, RowContext, RowProblem } from "../types/context";
import { Obj } from "../types/utilTypes";
import { assertTruthy, deepFreeze, wrapDefined } from "../utils";
import { freezeResult, memoList, memoizeMulti } from "../utils/functional";
import { compareTypes } from "./compareTypes";
import { findEnvironmentSignature } from "./environment";
import { generateDefaultValue } from "./generateDefaultValue";
import { GraphTypeException, memoizeTypeStructure, types } from "./typeStructure";
import { validateValue } from "./validateValue";

export function validateNode(
    node: FlowNode,
    environment: FlowEnvironment,
    earlierNodeOutputTypes: Map<string, MapTypeSpecifier>,
    isUsed: boolean,
): FlowNodeContext {
    const templateSignature = findEnvironmentSignature(environment, node.signature);
    if (templateSignature == null) {
        return bundleNoSignatureContext(node, isUsed);
    }

    const inputContexts: RowContext[] = [];
    for (const input of templateSignature.inputs) {
        const rowState = node.rowStates[input.id] as RowState | undefined;
        const connectedTypes = selectConnectedTypes(rowState, earlierNodeOutputTypes);
        const rowResult = validateRows(input, rowState, connectedTypes, environment);
        inputContexts.push(rowResult);
    }
    
    return bundleNodeContext(
        node,
        isUsed, 
        templateSignature,
        ...inputContexts,
    );
}

const bundleNoSignatureContext = memoizeMulti(freezeResult(
    (node: FlowNode, isUsed: boolean): FlowNodeContext => ({
        ref: node,
        problems: [{
            type: 'missing-signature',
            signature: node.signature,
        }],
        outputSpecifier: null,
        templateSignature: null,
        rowContexts: {},
        isUsed,
    })
));

const bundleNodeContext = memoizeMulti(freezeResult((
    node: FlowNode,
    isUsed: boolean,
    templateSignature: FlowSignature,
    ...inputContexts: RowContext[] // automatically memoizes into list
): FlowNodeContext => {

    const result: FlowNodeContext = {
        ref: node,
        problems: [],
        templateSignature,
        outputSpecifier: getSignatureOutputType(templateSignature),
        rowContexts: {},
        isUsed,
    };
    assertTruthy(templateSignature.inputs.length === inputContexts.length);
    for (let i = 0; i < templateSignature.inputs.length; i++) {
        result.rowContexts[templateSignature.inputs[i].id] = inputContexts[i];
    }
    return result;
}));

const getSignatureOutputType = (signature: FlowSignature): MapTypeSpecifier => {
    const rowTypes: Obj<TypeSpecifier> = {};
    for (const output of signature.outputs) {
        rowTypes[output.id] = output.dataType;
    }
    const mapType: MapTypeSpecifier = {
        type: 'map',
        elements: rowTypes,
    };
    const uniqueMemoized = memoizeTypeStructure(mapType);
    return uniqueMemoized as MapTypeSpecifier;
}

const selectConnectedTypes = memoizeMulti((
    rowState: RowState | undefined,
    earlierNodeOutputTypes: Map<string, MapTypeSpecifier>,
) => {
    // each node input receives a list of connections to support list inputs
    const connectedTypes: TypeSpecifier[] = rowState?.connections.map(conn => {
        const sourceOutput = earlierNodeOutputTypes.get(conn.nodeId);
        const rowOutputType = sourceOutput?.elements[conn.outputId];
        if (!rowOutputType) {
            return types.createUnknown();
        }
        return rowOutputType;
    }) || [];
    return memoList(...connectedTypes);
});

const validateRows = memoizeMulti(freezeResult((
    input: InputRowSignature,
    rowState: RowState | undefined,
    connectedTypeList: TypeSpecifier[],
    environment: FlowEnvironment
): RowContext => {

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
));

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
