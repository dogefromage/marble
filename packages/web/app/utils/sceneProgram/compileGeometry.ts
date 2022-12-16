import { DefaultFunctionArgs, GeometryConnectionData, GeometryProgramMethod, GeometryS, GNodeT, GNodeTemplateTags, InputOnlyRowT, ObjMap, ProgramInclude, ProgramTextureVarMapping, RowTypes } from "../../types";
import { Counter } from "../Counter";
import { checkGeometryAcyclic } from "./checkGeometryAcyclic";
import { GeometriesCompilationError, GeometriesCompilationErrorTypes } from "./compilationError";
import findUsedNodes from "./findUsed";
import { generateTopologicalOrder } from "./generateTopologicalOrder";
import { compileNodeInstructions } from "./operationCompiler";

export function compileGeometry(
    geometry: GeometryS,
    connectionData: GeometryConnectionData,
    textureCoordinateCounter: Counter,
)
{
    /**
     * Form of a geometry
     * - must have output
     * - must be valid & acyclic graph
     */

    // find lowest index where a node has an output tag
    let outputIndex = -1;
    for (let i = geometry.nodes.length - 1; i >= 0; i--) {
        if (geometry.nodes[i].tags?.includes(GNodeTemplateTags.Output)) {
            outputIndex = i;
            break;
        }
    }
    if (outputIndex < 0)
        throw new GeometriesCompilationError(
            GeometriesCompilationErrorTypes.OutputMissing,
        );

    if (connectionData.strayConnectedJoints.length > 0)
        throw new GeometriesCompilationError(
            GeometriesCompilationErrorTypes.InvalidGraph,
        )

    const foundCycles = checkGeometryAcyclic(connectionData.forwardEdges);
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

    const used = findUsedNodes(connectionData.forwardEdges, outputIndex);
    const topoOrder = generateTopologicalOrder(connectionData.forwardEdges, outputIndex);
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
        const template = connectionData.templateMap.get(node.id);
    
        if (!template)
        {
            throw new GeometriesCompilationError(GeometriesCompilationErrorTypes.TemplateMissing);
        }

        const nodeCompilerOutput = compileNodeInstructions(
            nodeIndex, node, template,
            textureCoordinateCounter,
            connectionData.backwardEdges[nodeIndex],
        );
        
        nodeCompilerOutput.includedTokens
            .forEach(token => includedTokenSet.add(token));

        nodeCompilerOutput.instructions
            .forEach(instruction => programInstructions.push(instruction));

        Object.assign(textureVarMappings, nodeCompilerOutput.textureVarMappings);
    }

    const includedTokens = [ ...includedTokenSet ];

    // not final, must choose right output row (or construct object if multiple rows maybe)
    const outputNodeId = geometry.nodes[outputIndex].id;
    const outputTemplate = connectionData.templateMap.get(outputNodeId)!;
    const outputInputRow = outputTemplate.rows.find(row => row.id === 'input');
    const methodReturnType = (outputInputRow as InputOnlyRowT).dataType;

    const finalProgram: GeometryProgramMethod =
    {
        geometryId: geometry.id,
        compilationValidity: geometry.compilationValidity,
        includedTokens,
        programInstructions,
        methodName: `geometry_${geometry.id}`,
        functionArgs,
        textureVarMappings,
        methodReturnType,
    }

    // console.log(finalProgram);

    return finalProgram;
}