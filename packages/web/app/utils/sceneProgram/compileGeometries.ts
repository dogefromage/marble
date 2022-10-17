import { getRowMetadata } from "../../components/GeometryRowRoot";
import { Counter, DefaultFunctionArgs, GeometryZ, GLSLSnippet, GNodeZ, InputOnlyRowT, JointDirection, ObjMap, OutputRowT, ProgramArithmeticOperation, ProgramCallOperation, ProgramConstant, ProgramOperation, ProgramOperationTypes, ProgramOutputOperation, ProgramTextureVar, ProgramTextureVarMapping, RowZ, SceneProgram, TEXTURE_VAR_DATATYPE_SIZE } from "../../types";
import { assertRowHas } from "../geometries/assertions";
import { generateAdjacencyLists, GeometryEdge } from "../geometries/generateAdjacencyLists";
import { getRowById } from "../geometries/getRows";
import rowLocationKey from "../geometries/rowLocationKey";
import { checkGeometryAcyclic } from "./checkGeometryAcyclic";
import findUsedNodes from "./findUsed";
import { generateTopologicalOrder } from "./generateTopologicalOrder";
import { generateConstantName, generateTextureVarName } from "./programSymbolNames";

export enum GeometriesCompilationErrorTypes
{
    OutputMissing = 'output-missing',
    HasCycle = 'has-cycle',
    SnippetMissing = 'snippet-missing',
}

export class GeometriesCompilationError extends Error
{
    constructor(
        public type: GeometriesCompilationErrorTypes
    )
    {
        super(`Error "${type}" at compiling geometry`);
    }
}

function createTextureVar(nodeIndex: number, rowIndex: number, row: RowZ, textureCoordinate: number)
{
    if (!assertRowHas<InputOnlyRowT>(row, 'value', 'dataType'))
    {
        console.log({ nodeIndex, rowIndex });
        throw new Error(`Row (${nodeIndex + ', ' + rowIndex}) must inherit from type BaseInputRowT`);
    }

    const variable: ProgramTextureVar =
    {
        name: generateTextureVarName(nodeIndex, rowIndex), 
        // value: row.value, 
        dataType: row.dataType,
        textureCoordinate,
    };
    
    return variable;
}

function createConstant(nodeIndex: number, rowIndex: number, row: RowZ)
{
    if (!assertRowHas<InputOnlyRowT>(row, 'value', 'dataType'))
    {
        console.log({ nodeIndex, rowIndex });
        throw new Error(`Row (${nodeIndex + ', ' + rowIndex}) must inherit from type BaseInputRowT`);
    }

    const constant: ProgramConstant =
    {
        name: generateConstantName(nodeIndex, rowIndex), 
        dataType: row.dataType,
        value: row.value,
    };
    
    return constant;
}

function curriedRowVarNameGenerator(
    nodeIndex: number,
    node: GNodeZ,
    incomingEdges: ObjMap<GeometryEdge>,
    outgoingEdges: ObjMap<GeometryEdge[]>,
    constants: ProgramConstant[], 
    textureVars: ProgramTextureVar[],
    textureCoordinateCounter: Counter,
    textureVarMappings: ObjMap<ProgramTextureVarMapping>
)
{
    return (rowId: string, direction: JointDirection) =>
    {
        const { rowIndex, row } = 
            getRowById<InputOnlyRowT>(node, rowId);

        if (direction === 'input')
        {
            // case 1: connection
            const incomingEdgeKey = incomingEdges?.[rowIndex]?.edgeKey;
            if (incomingEdgeKey) 
                return incomingEdgeKey;

            // case 2: fallback function argument
            if (row.alternativeArg)
                return row.alternativeArg;

            const rowMetadata = getRowMetadata(row);

            // case 3: parameter texture lookup
            if (rowMetadata.dynamicValue)
            {
                const textureCoord = textureCoordinateCounter.current;
                const size = TEXTURE_VAR_DATATYPE_SIZE[row.dataType];
                textureCoordinateCounter.current += size;

                const textureVar = createTextureVar(nodeIndex, rowIndex, row, textureCoord);
                textureVars.push(textureVar);

                const textureVarMapping: ProgramTextureVarMapping = 
                {
                    textureCoordinate: textureVar.textureCoordinate,
                    dataTypes: textureVar.dataType,
                    nodeIndex,
                    rowIndex,
                };
                const uniqueRowKey = rowLocationKey(node.id, row.id);
                textureVarMappings[uniqueRowKey] = textureVarMapping;

                return textureVar.name;
            }

            // case 4: fixed constant
            const constant = createConstant(nodeIndex, rowIndex, row);
            constants.push(constant);
            return constant.name;
        }
        else
        {
            const outgoingEdgeKey = outgoingEdges?.[rowIndex]?.[0]?.edgeKey;
            if (outgoingEdgeKey) return outgoingEdgeKey;

            throw new Error(`This theoretically shouldn't happen, since a node should not be compiled to an operation if it's not needed in the program.`);
        }
    }
}

export function compileGeometries(
    geometry: GeometryZ,
    glslSnippets: ObjMap<GLSLSnippet>,
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
        
    const usedGLSLSnippets = new Set<GLSLSnippet>();

    const functionArgs = [ ...DefaultFunctionArgs ];
    const constants: ProgramConstant[] = [];
    const textureVars: ProgramTextureVar[] = [];
    const textureVarMappings: ObjMap<ProgramTextureVarMapping> = {};

    const operations: ProgramOperation[] =
            orderedUsedNodes.map(nodeIndex =>
    {
        const node = geometry.nodes[nodeIndex];

        const genRowVarName = curriedRowVarNameGenerator(
            nodeIndex,
            node, 
            backwardsAdjList[nodeIndex],
            forwardsAdjList[nodeIndex],
            constants,
            textureVars,
            textureCoordinateCounter,
            textureVarMappings,
        );

        for (const snippetId of node.glslSnippedIds)
        {
            const snippet = glslSnippets[snippetId];
            if (!snippet) throw new GeometriesCompilationError(
                GeometriesCompilationErrorTypes.SnippetMissing,
            );

            usedGLSLSnippets.add(snippet);
        }

        const nodeOp = node.operation;
        if (nodeOp.type === ProgramOperationTypes.Output)
        {
            const outputOp: ProgramOutputOperation = 
            {
                type: ProgramOperationTypes.Output,
                input: genRowVarName(nodeOp.inputRowId, 'input'),
            }
            return outputOp;
        }
        if (nodeOp.type === ProgramOperationTypes.Arithmetic)
        { 
            const { row: outputRow } = 
                getRowById<OutputRowT>(node, nodeOp.outputRowId);

            const arithmeticOp: ProgramArithmeticOperation = 
            {
                type: ProgramOperationTypes.Arithmetic,
                lhs: genRowVarName(nodeOp.lhsRowId, 'input'),
                rhs: genRowVarName(nodeOp.rhsRowId, 'input'),
                outputElement: genRowVarName(nodeOp.outputRowId, 'output'),
                outputDatatype: outputRow.dataType,
                operation: nodeOp.operation,
            }
            return arithmeticOp;
        }
        if (nodeOp.type === ProgramOperationTypes.Call)
        {
            const { row: outputRow } = 
                getRowById<OutputRowT>(node, nodeOp.outputRowId);

            const callOp: ProgramCallOperation = 
            {
                type: ProgramOperationTypes.Call,
                functionArgs: nodeOp.argumentRowIds.map(
                    id => genRowVarName(id, 'input')
                ),
                functionName: nodeOp.functionName,
                outputElement: genRowVarName(nodeOp.outputRowId, 'output'),
                outputDatatype: outputRow.dataType,
            }
            return callOp;
        }

        throw new Error(`Operation not found`);
    });

    const { row: outputRow } = 
        getRowById<OutputRowT>(geometry.nodes[outputIndex], 'input');

    const includedGLSLCode = [ ...usedGLSLSnippets ].map(s => s.code);

    const program: SceneProgram =
    {
        includedGLSLCode,
        functionArgs,
        constants,
        textureVars,
        textureVarMappings,
        operations,
        methodName: `geometry_${geometry.id}`,
        methodReturnType: outputRow.dataType,
    }

    // console.log(program);

    return program;
}