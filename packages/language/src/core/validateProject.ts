import { FlowEntryPoint, FlowEnvironmentContent, FlowGraph, FlowSignature, FlowSignatureId, InputRowSignature, OutputRowSignature } from "../types";
import { FlowGraphContext, ProjectContext } from "../types/context";
import { Obj } from "../types/utilTypes";
import { deepFreeze } from "../utils";
import { findDependencies, sortTopologically } from "../utils/algorithms";
import { memoizeMulti } from "../utils/functional";
import { createEnvironment, pushContent } from "./environment";
import { collectFlowDependencies, validateFlowGraph } from "./validateFlowGraph";

export function validateProject(
    flowGraphs: Obj<FlowGraph>,
    content: FlowEnvironmentContent,
    entryPoints: Obj<FlowEntryPoint>,
): ProjectContext {
    const result: ProjectContext = {
        ref: flowGraphs,
        flowContexts: {},
        problems: [],
        topologicalFlowOrder: [],
        entryPointDependencies: {},
    }

    let currentEnvironment = createEnvironment(content);

    const flowEntries = Object.entries(flowGraphs);
    const numberedAdjacency = new Array(flowEntries.length).fill([]).map(_ => [] as number[]);
    for (let i = 0; i < flowEntries.length; i++) {
        const flow = flowEntries[i][1];
        const flowDependencies = collectFlowDependencies(flow);
        for (const signature of flowDependencies) {
            // find index of dependency
            const [ signatureType, signatureName ] = signature.split(':');
            if (signatureType === 'composed') {
                const depIndex = flowEntries
                    .findIndex(entry => entry[0] === signatureName);
                if (depIndex >= 0) {
                    numberedAdjacency[depIndex].push(i);
                }
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
        const flowSyntaxContent = generateFlowSyntaxLayer(graph.inputs, graph.outputs);
        const flowSyntaxEnv = pushContent(currentEnvironment, flowSyntaxContent);
        const flowContext = validateFlowGraph(graph, flowSyntaxEnv);
        result.flowContexts[graphId] = flowContext;

        // extend environment
        currentEnvironment = pushContent(currentEnvironment, flowSignatureContent(flowContext))
    }

    deepFreeze(result);
    return result;
};

const flowSignatureContent = memoizeMulti(
    (flowContext: FlowGraphContext): FlowEnvironmentContent => ({
        signatures: { [generateComposedId(flowContext.ref)]: flowContext.flowSignature },
        types: {},
    })
);

const generateComposedId = (flow: FlowGraph): FlowSignatureId => {
    return `composed:${flow.id}`;
}

const generateFlowSyntaxLayer = memoizeMulti(generateFlowSyntaxLayerInitial);
function generateFlowSyntaxLayerInitial(
    flowInputs: InputRowSignature[],
    flowOutputs: OutputRowSignature[],
): FlowEnvironmentContent {
    const input: FlowSignature = {
        id: `syntax:input`,
        name: 'Input',
        description: null,
        attributes: { category: 'In/Out' },
        inputs: [],
        outputs: flowInputs.map(o => ({
            id: o.id,
            label: o.label,
            dataType: o.dataType,
            rowType: 'output',
            initializer: false,
        })),
    }
    const output: FlowSignature = {
        id: `syntax:output`,
        name: 'Output',
        description: null,
        attributes: { category: 'In/Out' },
        inputs: flowOutputs.map(o => ({
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
