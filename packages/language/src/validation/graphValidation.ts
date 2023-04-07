import { FlowGraph, GraphEnvironment, MapTypeSpecifier, InputRowSignature, OutputRowSignature, TypeSpecifier, FunctionSignature, FunctionSignatureId, FlowNode } from "../types";
import { Obj } from "../types/utils";
import { GraphTypeException, compareTypes } from "./typeStructureValidation";
import { assertDef, wrapDefined } from "../utils";
import { sortTopologically } from "../utils/algorithms";
import { ProgramValidationResult, GraphValidationResult, NodeValidationResult, ProgramProblem, RowValidationResult, RowProblem } from "../types/validation";

export function validateProgram(
    graphs: Obj<FlowGraph>,
    baseEnvironment: FunctionSignature[],
): ProgramValidationResult {
    const result: ProgramValidationResult = {
        graphs: {},
        problems: [],
    }

    const functionSignatures = baseEnvironment.slice();

    const graphEntries = Object.entries(graphs);
    const numberedAdjacency = new Array(graphEntries.length).fill([]).map(_ => [] as number[]);
    for (let i = 0; i < graphEntries.length; i++) {
        const [_, graph] = graphEntries[i];
        const signatureDeps = collectGraphDependencies(graph);
        for (const signature of signatureDeps) {
            // find index of dependency
            const depIndex = graphEntries
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
            .map(cycle => cycle.map(i => graphEntries[i][0]));
        result.problems.push({
            type: 'cyclic-graphs',
            cycles: namedCycles,
        });
    }

    for (const graphIndex of topSortResult.topologicalSorting) {
        const [graphId, graph] = graphEntries[graphIndex];
        const environment = generateSuitableEnvironment(graph, functionSignatures);
        const graphValidationResult = validateFlowGraph(graph, environment);
        functionSignatures.push(graphValidationResult.signature);
        result.graphs[graphId] = graphValidationResult;
    }

    return result;
}

export function generateSuitableEnvironment(
    graph: FlowGraph,
    functionSignatures: FunctionSignature[],
): GraphEnvironment {
    const functionEntries = functionSignatures
        .map(sig => [sig.id, sig] as const);
    const syntaxObj = generateSyntaxNodes(graph);
    const syntaxEntries = Object.entries(syntaxObj);

    return {
        functions: new Map([...functionEntries, ...syntaxEntries]),
    }
}

function generateSyntaxNodes(graph: FlowGraph) {
    const input: FunctionSignature = {
        id: `syntax:input`,
        version: graph.version,
        name: 'Input',
        category: 'In/Out',
        inputs: [],
        outputs: graph.inputs.map(o => ({
            id: o.id,
            label: o.label,
            dataType: o.dataType,
            rowType: 'output',
        })),
    }
    const output: FunctionSignature = {
        id: `syntax:output`,
        version: graph.version,
        name: 'Output',
        category: 'In/Out',
        inputs: graph.outputs.map(o => ({
            id: o.id,
            label: o.label,
            dataType: o.dataType,
            rowType: 'input-simple',
        })),
        outputs: [],
    }

    const values = [input, output];

    return Object.fromEntries(values.map(sig => [sig.id, sig]));
}

function collectGraphDependencies(graph: FlowGraph) {
    const signatures = new Set<FunctionSignatureId>();
    for (const node of Object.values(graph.nodes)) {
        signatures.add(node.signature);
    }
    return Array.from(signatures);
}

function validateFlowGraph(
    graph: FlowGraph,
    environment: GraphEnvironment,
): GraphValidationResult {

    const graphSignature: FunctionSignature = {
        id: `composed:${graph.id}`,
        category: 'Groups',
        version: graph.version,
        name: graph.name,
        inputs: graph.inputs,
        outputs: graph.outputs,
    }

    const result: GraphValidationResult = {
        nodes: {},
        problems: [],
        signature: graphSignature,
    }

    // represent graph as adjacency list, ignoring row information
    const nodeEntries = Object.entries(graph.nodes);
    const numberedAdjacency = new Array(nodeEntries.length).fill([]).map(_ => [] as number[]);
    for (let i = 0; i < nodeEntries.length; i++) {
        const [_, node] = nodeEntries[i];
        const dependencyIds = Object
            .values(node.rowStates)
            .map(state => state.connections)
            .flat()
            .map(connection => connection.nodeId);

        for (const depId of dependencyIds) {
            // find index of dependency
            const depIndex = nodeEntries
                .findIndex(entry => entry[0] === depId);
            if (depIndex >= 0) {
                numberedAdjacency[depIndex].push(i);
            } else {
                result.problems.push({
                    type: 'missing-node',
                    nodeId: depId,
                });
            }
        }
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

    // type checking algorithm
    const nodeOutputTypes = new Map<string, MapTypeSpecifier>();
    for (const nodeIndex of topSortResult.topologicalSorting) {
        const [nodeId, node] = nodeEntries[nodeIndex];
        const nodeResult = validateNode(node, environment, nodeOutputTypes);
        nodeOutputTypes.set(nodeId, nodeResult.specifier);
        result.nodes[nodeId] = nodeResult;
    }

    return result;
}

const emptyMapSpecifier: MapTypeSpecifier = {
    type: 'map',
    elements: {},
}

function validateNode(
    node: FlowNode,
    environment: GraphEnvironment,
    earlierNodeOutputTypes: Map<string, MapTypeSpecifier>
): NodeValidationResult {
    const functionDefinition = environment.functions.get(node.signature);
    if (functionDefinition == null) {
        return {
            specifier: emptyMapSpecifier,
            problems: [{
                type: 'missing-signature',
                signature: node.signature,
            }],
            rows: {},
        }
    }
    const outputTypeSpecifier = signatureRowsToMapType(functionDefinition.outputs);
    const rows = validateNodeInputs(node.rowStates, functionDefinition.inputs, earlierNodeOutputTypes);

    const result: NodeValidationResult = {
        problems: [],
        specifier: outputTypeSpecifier,
        rows,
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
    inputRowSigs: FunctionSignature['inputs'],
    earlierNodeOutputTypes: Map<string, MapTypeSpecifier>,
): Obj<RowValidationResult> {
    // each node input receives a list of connections to support list inputs
    const connectionTypeLists: Obj<TypeSpecifier[]> = {};
    for (const [rowId, rowState] of Object.entries(rowStates)) {
        const allConnections = rowState.connections.map(conn => {
            const sourceNodeOutput = assertDef(earlierNodeOutputTypes.get(conn.nodeId), `Node output should be in map nodeId=${conn.nodeId}`);
            const rowOutputType = sourceNodeOutput.elements[conn.outputId];
            return assertDef(rowOutputType, `Node output map is missing row "${conn.outputId}"`);
        });
        connectionTypeLists[rowId] = allConnections;
    }

    const rowResults: Obj<RowValidationResult> = {};

    for (const input of inputRowSigs) {
        const expectedType = input.dataType;
        const connectedTypeList = connectionTypeLists[input.id] || [];
        const inputProblems = validateNodeInput(input, expectedType, connectedTypeList);
        rowResults[input.id] = {
            specifier: expectedType,
            problems: inputProblems || [],
        };
    }

    return rowResults;
}

function validateNodeInput(
    input: InputRowSignature,
    expectedType: TypeSpecifier,
    connectedTypeList: TypeSpecifier[]
): RowProblem[] | undefined {
    if (input.rowType === 'input-list') {
        if (expectedType.type !== 'list') {
            return [{ type: 'invalid-signature' }];
        }
        const listProblems: RowProblem[] = [];
        for (let i = 0; i < connectedTypeList.length; i++) {
            const listItemProblem = compareParameterToExpected(connectedTypeList[i], expectedType.elementType, i);
            if (listItemProblem) {
                listProblems.push(listItemProblem);
            }
        }
        return listProblems;
    }
    const [singleType] = connectedTypeList;

    if (input.rowType === 'input-simple') {
        if (singleType == null) {
            return [{ type: 'required-parameter' }];
        }
        return wrapDefined(compareParameterToExpected(singleType, expectedType, 0));
    }
    if (input.rowType === 'input-nullable') {
        if (singleType == null) {
            return; // parameter is "nulled"
        }
        return wrapDefined(compareParameterToExpected(singleType, expectedType, 0));
    }

    throw new Error(`Unknown type ${(input as any).rowType}`);
}

function compareParameterToExpected(param: TypeSpecifier, expected: TypeSpecifier, connectionIndex: number): RowProblem | undefined {
    try {
        compareTypes(param, expected);
    } catch (e) {
        if (e instanceof GraphTypeException) {
            return {
                type: 'incompatible-type',
                connectionIndex,
                typeProblemMessage: e.message,
                typeProblemPath: e.path,
            }
        }
        throw e;
    }
}
