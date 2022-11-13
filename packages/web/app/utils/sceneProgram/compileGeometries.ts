import { DefaultFunctionArgs, GeometryZ, IncrementalProgramMetadata, ObjMap, OutputRowT, ProgramConstant, ProgramInclude, ProgramOperation, ProgramTextureVar, ProgramTextureVarMapping, GeometryProgramMethod, RowTypes, InputOnlyRowT } from "../../types";
import { Counter } from "../Counter";
import { generateAdjacencyLists } from "../geometries/generateAdjacencyLists";
import { getRowById } from "../geometries/getRows";
import { checkGeometryAcyclic } from "./checkGeometryAcyclic";
import { GeometriesCompilationError, GeometriesCompilationErrorTypes } from "./compilationError";
import { parseNodeOperations } from "./operationCompiler";
import findUsedNodes from "./findUsed";
import { generateTopologicalOrder } from "./generateTopologicalOrder";

export function compileGeometries(
    geometry: GeometryZ,
    glslIncludes: ObjMap<ProgramInclude>,
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
        
    const partialProgram: IncrementalProgramMetadata =
    {
        functionArgs: [ ...DefaultFunctionArgs ],
        // constants: [],
        // textureVars: [],
        textureVarMappings: {},
        includedTokens: new Set(),
    }

    // const operations: ProgramOperation[] = []

    const instructions: string[] = [];

    for (const nodeIndex of orderedUsedNodeIndices)
    {
        const node = geometry.nodes[nodeIndex];

        // for (const snippetId of node.includeIds)
        // {
        //     const snippet = glslSnippets[snippetId];
        //     if (!snippet) throw new GeometriesCompilationError(
        //         GeometriesCompilationErrorTypes.SnippetMissing,
        //     );

        //     partialProgram.includeIds.add(snippet);
        // }

        // const nodeOperations = parseNodeOperations(
        //     nodeIndex,
        //     node, 
        //     textureCoordinateCounter,
        //     partialProgram,
        //     backwardsAdjList[nodeIndex],
        // );

        const nodeCompilerOutput = compileNodeInstructions(
            nodeIndex,
            node,
            textureCoordinateCounter,
            backwardsAdjList[nodeIndex],
        );
        
        // for (const op of nodeOperations)
        // {
        //     operations.push(op);
        // }
    }

    // const includedGLSLCode = [ ...partialProgram.includeIds ].map(s => s.glslCode);

    const includedGLSLCode: string[] = [];
    partialProgram.includeIds.forEach(includeId => 
    {
        const include = glslIncludes[includeId];
        if (!include) throw new GeometriesCompilationError(
            GeometriesCompilationErrorTypes.IncludeMissing,
        );
        includedGLSLCode.push(include.glslCode);
    })

    const { row: outputInputRow } = 
        getRowById<InputOnlyRowT>(geometry.nodes[outputIndex], 'input', RowTypes.InputOnly);

    const finalProgram: GeometryProgramMethod =
    {
        includedGLSLCode,
        // operations,
        methodName: `geometry_${geometry.id}`,
        methodReturnType: outputInputRow.dataType,
        functionArgs: partialProgram.functionArgs,
        constants: partialProgram.constants,
        textureVars: partialProgram.textureVars,
        textureVarMappings: partialProgram.textureVarMappings,
    }

    // console.log(finalProgram);

    return finalProgram;
}