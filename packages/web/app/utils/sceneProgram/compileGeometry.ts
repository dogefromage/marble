import { DefaultFunctionArgs, GeometryProgramMethod, GeometryZ, InputOnlyRowT, ObjMap, ProgramInclude, ProgramTextureVarMapping, RowTypes } from "../../types";
import { Counter } from "../Counter";
import { generateAdjacencyLists } from "../geometries/generateAdjacencyLists";
import { getRowById } from "../geometries/getRows";
import { checkGeometryAcyclic } from "./checkGeometryAcyclic";
import { GeometriesCompilationError, GeometriesCompilationErrorTypes } from "./compilationError";
import findUsedNodes from "./findUsed";
import { generateTopologicalOrder } from "./generateTopologicalOrder";
import { compileNodeInstructions } from "./operationCompiler";

export function compileGeometry(
    geometry: GeometryZ,
    textureCoordinateCounter: Counter,
)
{
    /**
     * Form of a geometry
     * - must have output
     * - must be valid & acyclic graph
     */

    const outputIndex = geometry.nodes.findIndex(n => n.id === geometry.outputId);
    if (outputIndex < 0)
        throw new GeometriesCompilationError(
            GeometriesCompilationErrorTypes.OutputMissing,
        );

    const { forwardsAdjList, backwardsAdjList, strayConnectedJoints } = generateAdjacencyLists(geometry);
    
    if (strayConnectedJoints.length)
        throw new GeometriesCompilationError(
            GeometriesCompilationErrorTypes.InvalidGraph,
        )

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
    const orderedUsedNodeIndices = topoOrder.filter(index => used.has(index));

    /**
     * Program props
     */
    const functionArgs = [ ...DefaultFunctionArgs ];
    const textureVarMappings: ObjMap<ProgramTextureVarMapping> = {};
    const programInstructions: string[] = [];
    const includedTokenSet = new Set<string>();

    for (const nodeIndex of orderedUsedNodeIndices)
    {
        const node = geometry.nodes[nodeIndex];

        const nodeCompilerOutput = compileNodeInstructions(
            nodeIndex,
            node,
            textureCoordinateCounter,
            backwardsAdjList[nodeIndex],
        );
        
        nodeCompilerOutput.includedTokens
            .forEach(token => includedTokenSet.add(token));

        nodeCompilerOutput.instructions
            .forEach(instruction => programInstructions.push(instruction));

        Object.assign(textureVarMappings, nodeCompilerOutput.textureVarMappings);
    }

    const includedTokens = [ ...includedTokenSet ];

    // not final, must choose right output row (or construct object if multiple rows maybe)
    const { row } = getRowById<InputOnlyRowT>(
        geometry.nodes[outputIndex], 'input', RowTypes.InputOnly)!;

    const finalProgram: GeometryProgramMethod =
    {
        includedTokens,
        programInstructions,
        methodName: `geometry_${geometry.id}`,
        functionArgs,
        textureVarMappings,
        methodReturnType: row.dataType,
    }

    // console.log(finalProgram);

    return finalProgram;
}