
// export function emitPrograms(project: ProjectContext, topFlowIds: string[]) {
//     // filter out used flows by dynamic program using top sorting and dependencies
//     const { topologicalFlowOrder } = project;
//     const usedFlows = new Set(topFlowIds);
//     for (let i = topologicalFlowOrder.length - 1; i >= 0; i--) {
//         const flowId = topologicalFlowOrder[i];
//         if (usedFlows.has(flowId)) {
//             const flow = project.flowContexts[flowId];
//             for (const dependency of flow.dependencies) {
//                 usedFlows.add(dependency);
//             }
//         }
//     }
//     const usedSortedFlows = topologicalFlowOrder.filter(id => usedFlows.has(id));

//     // emit flows sorted
//     const flowEmissions = usedSortedFlows.map(id => {
//         const flow = assert(project.flowContexts[id]);
//         return emitFlow(flow);
//     });
//     return {
//         type: 'program',
//         orderedFlows: flowEmissions,
//     };
// }

// function emitFlow(flow: FlowGraphContext) {

    

//     return {
//         id: flow.ref.id.split(':')[1],
//         instructions: flow.filteredSortedNodes,
//     }
// }


// interface CallInstruction {
//     type: 'call';
//     functionName: string;
//     arguments: Record<string, string>;
// }
// interface AccessInstruction {
//     type: 'access';
//     value: string;
//     property: string;
// }
// interface StructureInstruction {
//     type: 'structure';
//     elements: Record<string, string>;
// }
// interface OutputInstruction {
//     type: 'output';
//     value: string;
// }

// type FlowInstruction =
//     | CallInstruction
//     | AccessInstruction
//     | StructureInstruction
//     | OutputInstruction