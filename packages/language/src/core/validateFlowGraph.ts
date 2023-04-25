import { FlowEnvironment, FlowGraph, FlowSignature, MapTypeSpecifier } from "../types";
import { EdgeColor, FlowEdge, FlowGraphContext } from "../types/context";
import { deepFreeze } from "../utils";
import { findDependencies, sortTopologically } from "../utils/algorithms";
import { validateNode } from "./validateNode";

export function validateFlowGraph(
    flow: FlowGraph,
    flowEnvironment: FlowEnvironment,
    graphDependencies: string[], 
): FlowGraphContext {

    const flowSignature: FlowSignature = {
        id: `composed:${flow.id}`,
        attributes: { category: 'Groups' },
        version: flow.version,
        description: null,
        name: flow.name,
        inputs: flow.inputs,
        outputs: flow.outputs,
    };

    const result: FlowGraphContext = {
        ref: flow,
        problems: [],
        nodeContexts: {},
        flowSignature,
        flowEnvironment,
        edges: {},
        sortedUsedNodes: [],
        dependencies: graphDependencies,
    };

    const missingNodes = new Set<string>();

    // edge information and adjacency list
    const nodeEntries = Object.entries(flow.nodes);
    const numberedAdjacency = new Array(nodeEntries.length)
        .fill([]).map(_ => [] as number[]);
    const allEdges: FlowEdge[] = [];
    for (let inputNodeIndex = 0; inputNodeIndex < nodeEntries.length; inputNodeIndex++) {
        const [inputNodeId, inputNode] = nodeEntries[inputNodeIndex];
        const inputNodeDepIndices = new Set<number>();

        for (const [inputRowId, inputRow] of Object.entries(inputNode.rowStates)) {
            const { connections } = inputRow!;
            const edgesOfInputRow: FlowEdge[] = [];
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
                const flowEdge: FlowEdge = {
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
                    color: 'normal',
                };
                result.edges[edgeId] = flowEdge;
                allEdges.push(flowEdge);
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
    const namedTopSort = topSortResult.topologicalSorting
        .map(i => nodeEntries[i][0]);
    // result.topologicalNodeOrder = namedTopSort;
    // filling type table bottom-up using topsort
    const nodeOutputTypes = new Map<string, MapTypeSpecifier>();
    for (const nodeId of namedTopSort) {
        const node = flow.nodes[nodeId];
        const nodeResult = validateNode(node, flowEnvironment, nodeOutputTypes);
        result.nodeContexts[nodeId] = nodeResult;
        if (nodeResult.outputSpecifier) {
            nodeOutputTypes.set(nodeId, nodeResult.outputSpecifier);
        }
    }

    type GraphEdgeKey = `${string}:${string}`;
    const edgeColors = new Map<GraphEdgeKey, EdgeColor>();

    // output and outputs dependencies
    let outputIndex = -1;
    for (let i = 0; i < nodeEntries.length; i++) {
        const node = nodeEntries[i][1];
        if (node.signature === 'syntax:output') {
            outputIndex = i;
            break;
        }
    }
    if (outputIndex < 0) {
        result.problems.push({
            type: 'output-missing',
        });
    } else {
        // mark nodes redundant
        const numberedOutputDeps = findDependencies(numberedAdjacency, outputIndex);
        const namedOutputDeps = Array.from(numberedOutputDeps)
            .map(index => nodeEntries[index][0]);
        const usedNodeIds = new Set(namedOutputDeps);

        for (const [nodeId, nodeContext] of Object.entries(result.nodeContexts)) {
            if (!usedNodeIds.has(nodeId)) {
                nodeContext.isRedundant = true;
            }
        }

        // mark edges redundant
        for (const edge of allEdges) {
            const targetNode = edge.target.nodeId;
            if (!usedNodeIds.has(targetNode)) {
                const edgeKey: GraphEdgeKey = `${edge.source.nodeId}:${edge.target.nodeId}`;
                edgeColors.set(edgeKey, 'redundant');
            }
        }

        result.sortedUsedNodes = namedTopSort.filter(nodeId => usedNodeIds.has(nodeId));
    }

    // mark cycles
    if (topSortResult.cycles.length) {
        const namedCycles = topSortResult.cycles
            .map(cycle => cycle.map(i => nodeEntries[i][0]));
        result.problems.push({
            type: 'cyclic-nodes',
            cycles: namedCycles,
        });
        // collect all edges (u,v) which are somewhere in a cycle
        for (const cycle of namedCycles) {
            for (let i = 0; i < cycle.length; i++) {
                let j = (i + 1) % cycle.length;
                const key: GraphEdgeKey = `${cycle[i]}:${cycle[j]}`;
                edgeColors.set(key, 'cyclic');
            }
        }
    }

    // color edges
    for (const edge of allEdges) {
        const edgeKey: GraphEdgeKey = `${edge.source.nodeId}:${edge.target.nodeId}`;
        edge.color = edgeColors.get(edgeKey) || edge.color;
    }

    deepFreeze(result);
    return result;
}
