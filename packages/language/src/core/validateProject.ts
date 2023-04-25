import _ from "lodash";
import { EnvironmentContent, FlowEntryPoint, FlowGraph, FlowNode, FlowSignature, FlowSignatureId } from "../types";
import { ProjectContext } from "../types/context";
import { Obj } from "../types/utilTypes";
import { assert, deepFreeze } from "../utils";
import { findDependencies, sortTopologically } from "../utils/algorithms";
import { LinkedFlowEnvironment } from "./LinkedFlowEnvironment";
import { validateFlowGraph } from "./validateFlowGraph";

export function validateProject(
    flowGraphs: Obj<FlowGraph>,
    content: EnvironmentContent,
    entryPoints: Obj<FlowEntryPoint>,
): ProjectContext {
    const result: ProjectContext = {
        ref: flowGraphs,
        flowContexts: {},
        problems: [],
        topologicalFlowOrder: [],
        entryPointDependencies: {},
    }

    let dynamicEnvironment = new LinkedFlowEnvironment(content);

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

    for (const [entryId, entryPoint] of Object.entries(entryPoints)) {
        const topFlowIndex = flowEntries
            .findIndex(flow => flow[0] === entryPoint.entryFlowId);
        if (topFlowIndex < 0) {
            result.problems.push({
                type: 'missing-top-flow',
                id: entryPoint.entryFlowId,
            });
        }
        const numberedDeps = findDependencies(numberedAdjacency, topFlowIndex);
        const namedDeps = new Set(
            Array.from(numberedDeps).map(index => flowEntries[index][0])
        );
        result.entryPointDependencies[entryId] = namedDeps;
    }

    for (const graphIndex of topSortResult.topologicalSorting) {
        const [graphId, graph] = flowEntries[graphIndex];
        const graphSyntaxContent = generateFlowSyntaxLayer(graph);

        dynamicEnvironment = dynamicEnvironment
            .push(graphSyntaxContent);

        const graphDependencies = assert(flowDependenciesMap.get(graphId));

        const graphContext = validateFlowGraph(graph, dynamicEnvironment, graphDependencies);
        const graphSignatureContent: EnvironmentContent = {
            signatures: { [graphId]: graphContext.flowSignature },
            types: {},
        }

        dynamicEnvironment = dynamicEnvironment
            .pop()
            .push(graphSignatureContent);

        result.flowContexts[graphId] = graphContext;
    }

    deepFreeze(result);
    return result;
};

function collectFlowDependencies(flow: FlowGraph) {
    const signatures = new Set<FlowSignatureId>();
    for (const node of Object.values(flow.nodes) as FlowNode[]) {
        signatures.add(node.signature);
    }
    return Array.from(signatures);
}

function generateFlowSyntaxLayer(graph: FlowGraph): EnvironmentContent {
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
    const signatures = Object.fromEntries([input, output].map(sig => [sig.id, sig]));
    return {
        signatures,
        types: {},
    }
}
