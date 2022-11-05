import { BinaryArithmeticOperation, GNodeZ, InvocationOperation, InvocationTreeOperation, ObjMap, OutputRowT, PartialProgram, ProgramOperation, ProgramOperationOptions, ProgramOperationTypes, ReturnOperation, RowTypes } from "../../types";
import { Counter } from "../Counter";
import { GeometryEdge } from "../geometries/generateAdjacencyLists";
import { getRowById } from "../geometries/getRows";
import { RowVarNameGenerator } from "./curriedRowVarNameGenerator";

interface CreateOperationProps<O extends ProgramOperationTypes>
{
    node: GNodeZ;
    varNameGenerator: RowVarNameGenerator;
    operationOps: ProgramOperationOptions<O>;
}

export function createOperation(
    nodeIndex: number,
    node: GNodeZ,
    textureCoordinateCounter: Counter,
    partialProgram: PartialProgram,
    incomingEdges: ObjMap<GeometryEdge[]>,
): ProgramOperation
{
    const varNameGenerator = new RowVarNameGenerator(
        nodeIndex, 
        node, 
        textureCoordinateCounter, 
        partialProgram,
        incomingEdges, 
    );

    const opType = node.operationOptions.type;

    const props: CreateOperationProps<ProgramOperationTypes> = 
    { 
        node, 
        varNameGenerator, 
        operationOps: node.operationOptions 
    };

    switch (opType)
    {
        case ProgramOperationTypes.Return:
            return createReturnOperation(props as CreateOperationProps<typeof opType>);
        case ProgramOperationTypes.BinaryArithmetic:
            return createBinaryArithmeticOperation(props as CreateOperationProps<typeof opType>);
        case ProgramOperationTypes.Invocation:
            return createInvocationOperation(props as CreateOperationProps<typeof opType>);
        case ProgramOperationTypes.InvocationTree:
            return createInvocationTreeOperation(props as CreateOperationProps<typeof opType>);
        default:
            throw new Error(`Operation not found`);
    }
}

function createReturnOperation(props: CreateOperationProps<ProgramOperationTypes.Return>)
{
    const { varNameGenerator: g, operationOps } = props;

    const outputOp: ReturnOperation = 
    {
        type: ProgramOperationTypes.Return,
        var_input: g.input(operationOps.var_input),
    }
    return outputOp;
}

function createBinaryArithmeticOperation(props: CreateOperationProps<ProgramOperationTypes.BinaryArithmetic>)
{
    const { node, varNameGenerator: g, operationOps } = props;

    const { row: outputRow } = 
        getRowById<OutputRowT>(node, operationOps.row_output, RowTypes.Output);

    const arithmeticOp: BinaryArithmeticOperation = 
    {
        type: ProgramOperationTypes.BinaryArithmetic,
        var_lhs: g.input(operationOps.row_lhs),
        var_rhs: g.input(operationOps.row_rhs),
        var_output: g.output(operationOps.row_output),
        type_output: outputRow.dataType,
        operation: operationOps.operation,
    }
    return arithmeticOp;
}

function createInvocationOperation(props: CreateOperationProps<ProgramOperationTypes.Invocation>)
{
    const { node, varNameGenerator: g, operationOps } = props;

    const { row: outputRow } = 
        getRowById<OutputRowT>(node, operationOps.row_output, RowTypes.Output);

    const invoc: InvocationOperation = 
    {
        type: ProgramOperationTypes.Invocation,
        var_args: operationOps.row_args.map(
            id => g.input(id)
        ),
        name_function: operationOps.name_function,
        var_output: g.output(operationOps.row_output),
        type_output: outputRow.dataType,
    }
    return invoc;
}

function createInvocationTreeOperation(props: CreateOperationProps<ProgramOperationTypes.InvocationTree>)
{
    const { node, varNameGenerator: g, operationOps } = props;

    const { row: outputRow } = 
        getRowById<OutputRowT>(node, operationOps.row_output, RowTypes.Output);

    const invocTree: InvocationTreeOperation = 
    {
        type: ProgramOperationTypes.InvocationTree,
        var_args: g.stacked(operationOps.row_args),
        name_function: operationOps.name_function,
        var_output: g.output(operationOps.row_output),
        type_output: outputRow.dataType,
        zero_value: operationOps.zero_value,
    }
    return invocTree;
}