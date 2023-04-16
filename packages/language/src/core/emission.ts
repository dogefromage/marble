import { FlowGraphContext, ProjectContext } from "../types/context";
import { assertDef } from "../utils";

export function emitPrograms(project: ProjectContext, topFlowIds: string[]) {
    // filter out used flows by dynamic program using top sorting and dependencies
    const { topologicalFlowOrder } = project;
    const usedFlows = new Set(topFlowIds);
    for (let i = topologicalFlowOrder.length; i >= 0; i--) {
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
        const flow = assertDef(project.flowContexts[id]);
        return emitFlow(flow);
    });
    return flowEmissions;
}

export function emitFlow(flow: FlowGraphContext) {
    
}