import { BinaryArithmeticOperation, GNodeZ, InvocationOperation, InvocationTreeOperation, ObjMap, PartialProgram, ProgramOperation, ProgramOperationOptions, ProgramOperationTypes, ReturnOperation } from "../../types";
import { Counter } from "../Counter";
import { GeometryEdge } from "../geometries/generateAdjacencyLists";
import { RowVarNameGenerator } from "./curriedRowVarNameGenerator";

interface CreateOperationProps<O extends ProgramOperationTypes>
{
    varNameGenerator: RowVarNameGenerator;
    operationOps: ProgramOperationOptions<O>;
}

export function parseNodeOperations(
    nodeIndex: number,
    node: GNodeZ,
    textureCoordinateCounter: Counter,
    partialProgram: PartialProgram,
    incomingEdges: ObjMap<GeometryEdge[]>,
): ProgramOperation[]
{
    const varNameGenerator = new RowVarNameGenerator(
        nodeIndex, 
        node, 
        textureCoordinateCounter, 
        partialProgram,
        incomingEdges, 
    );

    return node.operations.map(operationOps =>
    {
        const opType = operationOps.type;

        const props: CreateOperationProps<ProgramOperationTypes> = 
        { 
            varNameGenerator, 
            operationOps,
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
    });
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
    const { varNameGenerator: g, operationOps } = props;

    const arithmeticOp: BinaryArithmeticOperation = 
    {
        type: ProgramOperationTypes.BinaryArithmetic,
        operation: operationOps.operation,
        var_lhs: g.input(operationOps.row_lhs),
        var_rhs: g.input(operationOps.row_rhs),
        var_output: g.output(operationOps.row_output),
        type_output: operationOps.type_output,
    }
    return arithmeticOp;
}

function createInvocationOperation(props: CreateOperationProps<ProgramOperationTypes.Invocation>)
{
    const { varNameGenerator: g, operationOps } = props;

    const invoc: InvocationOperation = 
    {
        type: ProgramOperationTypes.Invocation,
        var_args: operationOps.row_args.map(
            id => g.input(id)
        ),
        name_function: operationOps.name_function,
        var_output: g.output(operationOps.row_output),
        type_output: operationOps.type_output,
    }
    return invoc;
}

function createInvocationTreeOperation(props: CreateOperationProps<ProgramOperationTypes.InvocationTree>)
{
    const { varNameGenerator: g, operationOps } = props;

    const invocTree: InvocationTreeOperation = 
    {
        type: ProgramOperationTypes.InvocationTree,
        name_function: operationOps.name_function,
        var_args: g.stacked(operationOps.row_args),
        zero_value: operationOps.zero_value,
        var_output: g.output(operationOps.row_output),
        type_output: operationOps.type_output,
    }
    return invocTree;
}