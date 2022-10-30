import { Counter, DefaultFunctionArgs, GeometryZ, PartialProgram, ObjMap, OutputRowT, ProgramConstant, ProgramInclude, ProgramOperation, ProgramTextureVar, ProgramTextureVarMapping, SceneProgram } from "../../types";
import { generateAdjacencyLists } from "../geometries/generateAdjacencyLists";
import { getRowById } from "../geometries/getRows";
import { checkGeometryAcyclic } from "./checkGeometryAcyclic";
import { GeometriesCompilationError, GeometriesCompilationErrorTypes } from "./compilationError";
import { createOperation } from "./createOperations";
import curriedRowVarNameGenerator from "./curriedRowVarNameGenerator";
import findUsedNodes from "./findUsed";
import { generateTopologicalOrder } from "./generateTopologicalOrder";

export function compileGeometries(
    geometry: GeometryZ,
    glslSnippets: ObjMap<ProgramInclude>,
    textureCoordinateCounter: Counter,
)
{
    /**
     * Form of a geometry
     * - must have output
     * - must be acyclic graph
     */

    const outputIndex = geometry.nodes.findIndex(n => n.id === geometry.outputId);
    if (outputIndex < 0)
        throw new GeometriesCompilationError(
            GeometriesCompilationErrorTypes.OutputMissing,
        );

    const { forwardsAdjList, backwardsAdjList } = generateAdjacencyLists(geometry);

    const foundCycles = checkGeometryAcyclic(forwardsAdjList);
    if (foundCycles.length)
        throw new GeometriesCompilationError(
            GeometriesCompilationErrorTypes.HasCycle,
        );

    /**
     * Interpretation of graph connections
     * - generate list of used
     * - create topological order
     * - generate function args
     * - generate variable names using adjList
     * - generate operation using topological order and variable names
     */

    const used = findUsedNodes(forwardsAdjList, outputIndex);
    const topoOrder = generateTopologicalOrder(forwardsAdjList, outputIndex);
    const orderedUsedNodes = topoOrder.filter(index => used.has(index));
        
    const partialProgram: PartialProgram =
    {
        functionArgs: [ ...DefaultFunctionArgs ],
        constants: [],
        textureVars: [],
        textureVarMappings: {},
        includeIds: new Set(),
    }

    const operations: ProgramOperation[] =
            orderedUsedNodes.map(nodeIndex =>
    {
        const node = geometry.nodes[nodeIndex];

        for (const snippetId of node.includeIds)
        {
            const snippet = glslSnippets[snippetId];
            if (!snippet) throw new GeometriesCompilationError(
                GeometriesCompilationErrorTypes.SnippetMissing,
            );

            partialProgram.includeIds.add(snippet);
        }

        return createOperation({
            nodeIndex,
            node, 
            incomingEdges: backwardsAdjList[nodeIndex],
            outgoingEdges: forwardsAdjList[nodeIndex],
            textureCoordinateCounter,
            partialProgram,
        });
    });

    const includedGLSLCode = [ ...partialProgram.includeIds ].map(s => s.glslCode);

    const { row: outputRow } = 
        getRowById<OutputRowT>(geometry.nodes[outputIndex], 'input');

    const finalProgram: SceneProgram =
    {
        includedGLSLCode,
        operations,
        methodName: `geometry_${geometry.id}`,
        methodReturnType: outputRow.dataType,
        functionArgs: partialProgram.functionArgs,
        constants: partialProgram.constants,
        textureVars: partialProgram.textureVars,
        textureVarMappings: partialProgram.textureVarMappings,
    }

    return finalProgram;
}