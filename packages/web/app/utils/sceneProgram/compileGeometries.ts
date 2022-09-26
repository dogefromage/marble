import { DataTypes, FieldRowT, GeometryZ, GNodeZ, InputRowT, JointDirection, ObjMap, OutputRowT, ProgramArithmeticOperation, ProgramCallOperation, ProgramConstant, ProgramOperation, ProgramOperationTypes, ProgramOutputOperation, RowValue, RowZ, SceneProgram } from "../../types";
import { generateAdjacencyLists, GeometryEdge } from "../geometries/generateAdjacencyLists";
import { getRowById } from "../geometries/getRows";
import { hasRowDataType, hasRowValue } from "../geometries/assertions";
import { checkGeometryAcyclic } from "./checkGeometryAcyclic";
import findUsedNodes from "./findUsed";
import { generateTopologicalOrder } from "./generateTopologicalOrder";
import { generateConstantSymbol } from "./programSymbols";
import { getDefaultValue } from "../geometries/getDefaultValue";

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

function createSymbol(nodeIndex: number, rowIndex: number, row: RowZ)
{
    const symbol = generateConstantSymbol(nodeIndex, rowIndex);
    if (!hasRowDataType(row))
    {
        console.log({ nodeIndex, rowIndex });
        throw new Error(`Above row must have datatype`);
    }
    const dataType = row.dataType;
    const value = (row as { value: RowValue }).value || getDefaultValue(row.dataType);

    const constant: ProgramConstant =
    {
        value, symbol, dataType,
    };
    
    return constant;
}

function curriedRowSymbolGenerator(
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
            const incomingSymbol = incomingEdges?.[rowIndex]?.symbol;

            if (incomingSymbol) return incomingSymbol;

            const constant = createSymbol(nodeIndex, rowIndex, row);
            constants.push(constant);
            return constant.symbol;
        }
        else
        {
            const outgoingSymbol = outgoingEdges?.[rowIndex]?.[0]?.symbol;
            if (outgoingSymbol) return outgoingSymbol;

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
     * - generate element symbols using adjList
     * - generate operation using topological order and symbols
     */

    const used = findUsedNodes(forwardsAdjList, outputIndex);
    const topoOrder = generateTopologicalOrder(forwardsAdjList);
    const orderedUsedNodes = topoOrder.filter(index => used.has(index));
    
    const programConstants: ProgramConstant[] = [];

    const programOperations: ProgramOperation[] =
            orderedUsedNodes.map(nodeIndex =>
    {
        const node = geometry.nodes[nodeIndex];

        const genRowSymbol = curriedRowSymbolGenerator(
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
                input: genRowSymbol(nodeOp.inputRowId, 'input'),
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
                lhs: genRowSymbol(nodeOp.lhsRowId, 'input'),
                rhs: genRowSymbol(nodeOp.rhsRowId, 'input'),
                outputElement: genRowSymbol(nodeOp.outputRowId, 'output'),
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
                arguments: nodeOp.argumentRowIds.map(
                    id => genRowSymbol(id, 'input')
                ),
                functionName: nodeOp.functionName,
                outputElement: genRowSymbol(nodeOp.outputRowId, 'output'),
                outputDatatype: outputRow.dataType,
            }
            return callOp;
        }

        throw new Error(`Operation not found`);
    });

    const program: SceneProgram =
    {
        constants: programConstants,
        operations: programOperations,
    }

    console.log(program);

    return program;
}