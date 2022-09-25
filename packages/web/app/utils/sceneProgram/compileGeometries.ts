import { GeometryZ, InputRowT, JointDirection, OutputRowT, ProgramArithmeticOperation, ProgramCallOperation, ProgramConstant, ProgramOperation, ProgramOperationTypes, ProgramOutputOperation, RowTypes, RowZ, SceneProgram } from "../../types";
import { generateAdjacencyLists } from "../geometries/generateAdjacencyLists";
import { getRowByIdAndType } from "../geometries/getRows";
import { checkGeometryAcyclic } from "./checkGeometryAcyclic";
import findUsedNodes from "./findUsed";
import { generateTopologicalOrder } from "./generateTopologicalOrder";
import { generateConstantSymbol } from "./programSymbols";

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
        const incomingEdges = backwardsAdjList[nodeIndex];
        const outgoingEdges = forwardsAdjList[nodeIndex];

        const nodeOp = node.operation;

        function createSymbol(rowIndex: number, row: RowZ)
        {
            console.warn('TODO: create default value or format existing depending on datatype');
            console.warn('TODO: add datatype ex. float to obj bc it will be needed for code generation');

            const value = (row as any).value || 0;
            const symbol = generateConstantSymbol(nodeIndex, rowIndex)
            programConstants.push({ value, symbol });
            return symbol;
        }

        function readOrGenRowSymbol(rowId: string, direction: JointDirection)
        {
            const { rowIndex, row } = 
                getRowByIdAndType<InputRowT>(node, rowId);

            if (direction === 'input')
            {
                const incomingSymbol = incomingEdges?.[rowIndex]?.symbol;

                if (incomingSymbol) return incomingSymbol;
                return createSymbol(rowIndex, row);
            }
            else
            {
                const outgoingSymbol = outgoingEdges?.[rowIndex]?.[0]?.symbol;
                if (outgoingSymbol) return outgoingSymbol;

                throw new Error(`This theoretically shoulnd't happen, since a node should not be compiled to an operation if it's not needed in the program.`);
            }
        }

        if (nodeOp.type === ProgramOperationTypes.Output)
        {
            const outputOp: ProgramOutputOperation = 
            {
                type: ProgramOperationTypes.Output,
                input: readOrGenRowSymbol(nodeOp.inputRowId, 'input'),
            }
            return outputOp;
        }
        if (nodeOp.type === ProgramOperationTypes.Arithmetic)
        { 
            const { row: outputRow } = 
                getRowByIdAndType<OutputRowT>(node, nodeOp.outputRowId, RowTypes.Output);

            const arithmeticOp: ProgramArithmeticOperation = 
            {
                type: ProgramOperationTypes.Arithmetic,
                lhs: readOrGenRowSymbol(nodeOp.lhsRowId, 'input'),
                rhs: readOrGenRowSymbol(nodeOp.rhsRowId, 'input'),
                outputElement: readOrGenRowSymbol(nodeOp.outputRowId, 'output'),
                outputDatatype: outputRow.dataType,
                operation: nodeOp.operation,
            }
            return arithmeticOp;
        }
        if (nodeOp.type === ProgramOperationTypes.Call)
        {
            const { row: outputRow } = 
                getRowByIdAndType<OutputRowT>(node, nodeOp.outputRowId, RowTypes.Output);

            const callOp: ProgramCallOperation = 
            {
                type: ProgramOperationTypes.Call,
                arguments: nodeOp.argumentRowIds.map(
                    id => readOrGenRowSymbol(id, 'input')
                ),
                functionName: nodeOp.functionName,
                outputElement: readOrGenRowSymbol(nodeOp.outputRowId, 'output'),
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