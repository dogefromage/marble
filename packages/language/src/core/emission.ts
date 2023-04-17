import { FlowGraphContext, ProjectContext } from "../types/context";
import { assert } from "../utils";

export function emitPrograms(project: ProjectContext, topFlowIds: string[]) {
    // filter out used flows by dynamic program using top sorting and dependencies
    const { topologicalFlowOrder } = project;
    const usedFlows = new Set(topFlowIds);
    for (let i = topologicalFlowOrder.length - 1; i >= 0; i--) {
        const flowId = topologicalFlowOrder[i];
        if (usedFlows.has(flowId)) {
            const flow = project.flowContexts[flowId];
            for (const dependency of flow.dependencies) {
                usedFlows.add(dependency);
            }
        }
    }
    const usedSortedFlows = topologicalFlowOrder.filter(id => usedFlows.has(id));

    // emit flows sorted
    const flowEmissions = usedSortedFlows.map(id => {
        const flow = assert(project.flowContexts[id]);
        return emitFlow(flow);
    });
    return {
        type: 'program',
        orderedFlows: flowEmissions,
    };
}

function emitFlow(flow: FlowGraphContext) {
    return {
        type: 'flow',
        id: flow.ref.id,
    }
}