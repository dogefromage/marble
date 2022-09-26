import { DefaultFunctionArgs, GeometryZ, GNodeZ, InputRowT, JointDirection, ObjMap, OutputRowT, ProgramArithmeticOperation, ProgramCallOperation, ProgramConstant, ProgramOperation, ProgramOperationTypes, ProgramOutputOperation, RowZ, SceneProgram } from "../../types";
import { assertRowHas } from "../geometries/assertions";
import { generateAdjacencyLists, GeometryEdge } from "../geometries/generateAdjacencyLists";
import { getRowById } from "../geometries/getRows";
import { checkGeometryAcyclic } from "./checkGeometryAcyclic";
import findUsedNodes from "./findUsed";
import { generateTopologicalOrder } from "./generateTopologicalOrder";
import { generateConstantName } from "./programVarNames";

export enum GeometriesCompilationErrorTypes
{
    OutputMissing = 'output-missing',
    HasCycle = 'has-cycle',
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

function createConstantName(nodeIndex: number, rowIndex: number, row: RowZ)
{
    if (!assertRowHas<InputRowT>(row, 'value', 'dataType'))
    {
        console.log({ nodeIndex, rowIndex });
        throw new Error(`Row (${nodeIndex + ', ' + rowIndex}) must inherit from type BaseInputRowT`);
    }

    const constant: ProgramConstant =
    {
        element: generateConstantName(nodeIndex, rowIndex), 
        value: row.value, 
        dataType: row.dataType,
    };
    
    return constant;
}

function curriedRowVarNameGenerator(
    nodeIndex: number,
    node: GNodeZ,
    incomingEdges: ObjMap<GeometryEdge>,
    outgoingEdges: ObjMap<GeometryEdge[]>,
    constants: ProgramConstant[],
)
{
    return (rowId: string, direction: JointDirection) =>
    {
        const { rowIndex, row } = 
            getRowById<InputRowT>(node, rowId);

        if (direction === 'input')
        {
            // case 1: connection
            const incomingEdgeKey = incomingEdges?.[rowIndex]?.edgeKey;
            if (incomingEdgeKey) return incomingEdgeKey;

            // case 2: fallback function argument
            if (row.alternativeArg)
                return row.alternativeArg;

            /**
             * case 3: create constant symbol using row value
             * -> in future, set this to a pixel of a texture, which can be rapidly updated
             */
            const constant = createConstantName(nodeIndex, rowIndex, row);
            constants.push(constant);
            return constant.element;
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

    const programFunctionArgs = [ ...DefaultFunctionArgs ];
    
    const programConstants: ProgramConstant[] = [];

    const programOperations: ProgramOperation[] =
            orderedUsedNodes.map(nodeIndex =>
    {
        const node = geometry.nodes[nodeIndex];

        const genRowVarName = curriedRowVarNameGenerator(
            nodeIndex,
            node, 
            backwardsAdjList[nodeIndex],
            forwardsAdjList[nodeIndex],
            programConstants,
        );

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

    const program: SceneProgram =
    {
        functionArgs: programFunctionArgs,
        constants: programConstants,
        operations: programOperations,
        methodName: `geometry_${geometry.id}`,
        methodReturnType: outputRow.dataType,
    }

    // console.log(program);

    return program;
}