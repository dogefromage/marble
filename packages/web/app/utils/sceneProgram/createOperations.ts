import { BinaryArithmeticOperation, Counter, GNodeZ, InvocationOperation, InvocationTreeOperation, ObjMap, OutputRowT, PartialProgram, ProgramOperation, ProgramOperationOptions, ProgramOperationTypes, ReturnOperation } from "../../types";
import { GeometryEdge } from "../geometries/generateAdjacencyLists";
import { getRowById } from "../geometries/getRows";
import curriedRowVarNameGenerator, { RowVarNameGenerator } from "./curriedRowVarNameGenerator";

export interface OperationInformation
{
    nodeIndex: number;
    node: GNodeZ;
    incomingEdges: ObjMap<GeometryEdge>;
    outgoingEdges: ObjMap<GeometryEdge[]>;
    textureCoordinateCounter: Counter;
    partialProgram: PartialProgram;
}

interface CreateOperationProps<O extends ProgramOperationTypes>
{
    node: GNodeZ;
    genRowVarName: RowVarNameGenerator;
    operationOps: ProgramOperationOptions<O>;
}

export function createOperation(info: OperationInformation): ProgramOperation
{
    const genRowVarName = curriedRowVarNameGenerator(info);
    const { node } = info;
    const opType = node.operationOptions.type;

    const props: CreateOperationProps<ProgramOperationTypes> = 
    { 
        node, 
        genRowVarName, 
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
    }

    throw new Error(`Operation not found`);
}

function createReturnOperation(props: CreateOperationProps<ProgramOperationTypes.Return>)
{
    const { genRowVarName, operationOps } = props;

    const outputOp: ReturnOperation = 
    {
        type: ProgramOperationTypes.Return,
        var_input: genRowVarName(operationOps.var_input, 'input'),
    }
    return outputOp;
}

function createBinaryArithmeticOperation(props: CreateOperationProps<ProgramOperationTypes.BinaryArithmetic>)
{
    const { node, genRowVarName, operationOps } = props;

    const { row: outputRow } = 
    getRowById<OutputRowT>(node, operationOps.row_output);

    const arithmeticOp: BinaryArithmeticOperation = 
    {
        type: ProgramOperationTypes.BinaryArithmetic,
        var_lhs: genRowVarName(operationOps.row_lhs, 'input'),
        var_rhs: genRowVarName(operationOps.row_rhs, 'input'),
        var_output: genRowVarName(operationOps.row_output, 'output'),
        type_output: outputRow.dataType,
        operation: operationOps.operation,
    }
    return arithmeticOp;
}

function createInvocationOperation(props: CreateOperationProps<ProgramOperationTypes.Invocation>)
{
    const { node, genRowVarName, operationOps } = props;

    const { row: outputRow } = 
        getRowById<OutputRowT>(node, operationOps.row_output);

    const invoc: InvocationOperation = 
    {
        type: ProgramOperationTypes.Invocation,
        var_args: operationOps.row_args.map(
            id => genRowVarName(id, 'input')
        ),
        name_function: operationOps.name_function,
        var_output: genRowVarName(operationOps.row_output, 'output'),
        type_output: outputRow.dataType,
    }
    return invoc;
}

function createInvocationTreeOperation(props: CreateOperationProps<ProgramOperationTypes.InvocationTree>)
{
    const { node, genRowVarName, operationOps } = props;

    const { row: outputRow } = 
        getRowById<OutputRowT>(node, operationOps.row_output);

    const invocTree: InvocationTreeOperation = 
    {
        type: ProgramOperationTypes.InvocationTree,
        var_args: operationOps.row_args.map(
            id => genRowVarName(id, 'input')
        ),
        name_function: operationOps.name_function,
        var_output: genRowVarName(operationOps.row_output, 'output'),
        type_output: outputRow.dataType,
    }
    return invocTree;
}