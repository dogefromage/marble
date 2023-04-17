import { EnvironmentContent, FlowEnvironment, FlowGraph, FlowNode, FlowSignature, FlowSignatureId, InitializerValue, InputRowSignature, MapTypeSpecifier, OutputRowSignature, RowState, TypeSpecifier } from "../types";
import { FlowGraphContext, FlowNodeContext, ProjectContext, RowContext, RowProblem } from "../types/context";
import { Obj } from "../types/utils";
import { assert, wrapDefined } from "../utils";
import { sortTopologically } from "../utils/algorithms";
import { GraphTypeException, compareTypes, generateDefaultValue, validateValue } from "./typeStructure";

export function validateProject(
    flowGraphs: Obj<FlowGraph>,
    content: EnvironmentContent,
): ProjectContext {
    const result: ProjectContext = {
        ref: flowGraphs,
        flowContexts: {},
        problems: [],
        topologicalFlowOrder: [],
    }

    let dynamicEnvironment = new FlowEnvironment(content);

    const flowEntries = Object.entries(flowGraphs);
    const flowDependenciesMap = new Map<string, string[]>();
    const numberedAdjacency = new Array(flowEntries.length).fill([]).map(_ => [] as number[]);
    for (let i = 0; i < flowEntries.length; i++) {
        const flow = flowEntries[i][1];
        const flowDependencies = collectFlowDependencies(flow);
        flowDependenciesMap.set(flow.id, flowDependencies);
        for (const signature of flowDependencies) {
            // find index of dependency
            const depIndex = flowEntries
                .findIndex(entry => entry[0] === signature);
            if (depIndex >= 0) {
                numberedAdjacency[depIndex].push(i);
            }
            // here it doesn't matter if the dependency is invalid
        }
    }

    const topSortResult = sortTopologically(numberedAdjacency);
    if (topSortResult.cycles.length) {
        const namedCycles = topSortResult.cycles
            .map(cycle => cycle.map(i => flowEntries[i][0]));
        result.problems.push({
            type: 'cyclic-flows',
            cycles: namedCycles,
        });
    }
    result.topologicalFlowOrder = topSortResult.topologicalSorting.map(i => flowEntries[i][0]);

    for (const graphIndex of topSortResult.topologicalSorting) {
        const [graphId, graph] = flowEntries[graphIndex];
        const graphSyntaxContent = generateSyntaxLayer(graph);

        dynamicEnvironment = dynamicEnvironment
            .push(graphSyntaxContent);

        const graphContext = validateFlowGraph(graph, dynamicEnvironment);
        const graphSignatureContent: EnvironmentContent = {
            signatures: { [graphId]: graphContext.flowSignature },
            types: {},
        }

        dynamicEnvironment = dynamicEnvironment
            .pop(graphSyntaxContent)
            .push(graphSignatureContent);

        result.flowContexts[graphId] = graphContext;

        graphContext.dependencies = assert(flowDependenciesMap.get(graphId));
        graphContext.dependants = numberedAdjacency[graphIndex]
            .map(index => flowEntries[index][0]);
    }

    return result;
}

function generateSyntaxLayer(graph: FlowGraph): EnvironmentContent {
    const input: FlowSignature = {
        id: `syntax:input`,
        version: graph.version,
        name: 'Input',
        description: null,
        attributes: { category: 'In/Out' },
        inputs: [],
        outputs: graph.inputs.map(o => ({
            id: o.id,
            label: o.label,
            dataType: o.dataType,
            rowType: 'output',
            initializer: false,
        })),
    }
    const output: FlowSignature = {
        id: `syntax:output`,
        version: graph.version,
        name: 'Output',
        description: null,
        attributes: { category: 'In/Out' },
        inputs: graph.outputs.map(o => ({
            id: o.id,
            label: o.label,
            dataType: o.dataType,
            rowType: 'input-simple',
            initializer: false,
        })),
        outputs: [],
    }

    const values = [input, output];
    const signatures = Object.fromEntries(values.map(sig => [sig.id, sig]));
    return {
        signatures,
        types: {},
    };
}

function collectFlowDependencies(flow: FlowGraph) {
    const signatures = new Set<FlowSignatureId>();
    for (const node of Object.values(flow.nodes) as FlowNode[]) {
        signatures.add(node.signature);
    }
    return Array.from(signatures);
}

function validateFlowGraph(
    flow: FlowGraph,
    flowEnvironment: FlowEnvironment,
): FlowGraphContext {

    const flowSignature: FlowSignature = {
        id: `composed:${flow.id}`,
        attributes: { category: 'Groups' },
        version: flow.version,
        description: null,
        name: flow.name,
        inputs: flow.inputs,
        outputs: flow.outputs,
    }

    const result: FlowGraphContext = {
        ref: flow,
        problems: [],
        nodeContexts: {},
        flowSignature,
        flowEnvironment,
        edges: {},
        topologicalNodeOrder: [],
        dependencies: [],
        dependants: [],
    }

    const missingNodes = new Set<string>();

    // edge information and adjacency list
    const nodeEntries = Object.entries(flow.nodes);
    const numberedAdjacency = new Array(nodeEntries.length)
        .fill([])
        .map(_ => [] as number[]);
    for (let inputNodeIndex = 0; inputNodeIndex < nodeEntries.length; inputNodeIndex++) {
        const [inputNodeId, inputNode] = nodeEntries[inputNodeIndex];
        const inputNodeDepIndices = new Set<number>();

        for (const [inputRowId, inputRow] of Object.entries(inputNode.rowStates)) {
            const { connections } = inputRow!;
            for (let inputIndex = 0; inputIndex < connections.length; inputIndex++) {
                const { nodeId: outputNodeId, outputId } = connections[inputIndex];
                // check if present
                const depIndex = nodeEntries
                    .findIndex(entry => entry[0] === outputNodeId);
                if (depIndex < 0) {
                    missingNodes.add(outputNodeId);
                    continue;
                }
                // adjacency
                inputNodeDepIndices.add(depIndex);
                // edge list
                const edgeId = `${outputNodeId}.${outputId}_${inputNodeId}.${inputRowId}.${inputIndex}`;
                result.edges[edgeId] = {
                    id: edgeId,
                    source: {
                        direction: 'output',
                        nodeId: outputNodeId,
                        rowId: outputId
                    },
                    target: {
                        direction: 'input',
                        nodeId: inputNodeId,
                        rowId: inputRowId,
                        jointIndex: inputIndex
                    },
                };
            }
        }

        for (const depIndex of inputNodeDepIndices) {
            numberedAdjacency[depIndex].push(inputNodeIndex);
        }
    }

    for (const missingId of missingNodes) {
        result.problems.push({
            type: 'missing-node',
            nodeId: missingId,
        });
    }

    const topSortResult = sortTopologically(numberedAdjacency);
    if (topSortResult.cycles.length) {
        const namedCycles = topSortResult.cycles
            .map(cycle => cycle.map(i => nodeEntries[i][0]));
        result.problems.push({
            type: 'cyclic-nodes',
            cycles: namedCycles,
        });
    }

    const namedTopSort = topSortResult.topologicalSorting
        .map(i => nodeEntries[i][0]);
    result.topologicalNodeOrder = namedTopSort;

    // type checking algorithm
    const nodeOutputTypes = new Map<string, MapTypeSpecifier>()
    for (const nodeId of namedTopSort) {
        const node = flow.nodes[nodeId];
        const nodeResult = validateNode(node, flowEnvironment, nodeOutputTypes);
        result.nodeContexts[nodeId] = nodeResult;
        if (nodeResult.outputSpecifier) {
            nodeOutputTypes.set(nodeId, nodeResult.outputSpecifier);
        }
    }

    return result;
}

function validateNode(
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
        }
    }
    const outputSpecifier = signatureRowsToMapType(templateSignature.outputs);
    const rowContexts = validateNodeInputs(node.rowStates, templateSignature.inputs, earlierNodeOutputTypes, environment);

    const result: FlowNodeContext = {
        ref: node,
        problems: [],
        templateSignature,
        outputSpecifier,
        rowContexts,
    };
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
    }
}

function validateNodeInputs(
    rowStates: FlowNode['rowStates'],
    inputRowSigs: FlowSignature['inputs'],
    earlierNodeOutputTypes: Map<string, MapTypeSpecifier>,
    environment: FlowEnvironment,
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
        rowResults[input.id] = rowResult;
    }

    return rowResults;
}

function validateRowInput(
    input: InputRowSignature,
    rowState: RowState | undefined,
    connectedTypeList: TypeSpecifier[],
    environment: FlowEnvironment,
): RowContext {
    const expectedType = input.dataType;
    const result: RowContext = {
        ref: rowState,
        problems: [],
        specifier: expectedType,
    }

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
            let displayValue: InitializerValue | undefined;
            if (rowState?.value != null) {
                const problem = validateValue(expectedType, rowState.value, environment);
                if (problem) {
                    result.problems.push(problem);
                } else {
                    displayValue = rowState.value;
                }
            }
            displayValue ||= generateDefaultValue(expectedType, environment);

            return result; // use initializer
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
            }
        }
        throw e;
    }
}
