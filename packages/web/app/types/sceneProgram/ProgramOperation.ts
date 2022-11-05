import { ProgramOperationTypes, DataTypes, ArithmeticOperations } from "./SceneProgram";

interface ReturnOperationOptions
{
    var_input: string;
    type: ProgramOperationTypes.Return;
}
export interface ReturnOperation extends ReturnOperationOptions {}

interface BinaryArithmeticOperationOptions
{
    type: ProgramOperationTypes.BinaryArithmetic;
    operation: ArithmeticOperations;
    row_lhs: string;
    row_rhs: string;
    row_output: string;
}
export interface BinaryArithmeticOperation
{
    type: ProgramOperationTypes.BinaryArithmetic;
    operation: ArithmeticOperations;
    var_lhs: string;
    var_rhs: string;
    var_output: string;
    type_output: DataTypes;
}

interface InvocationOperationOptions
{
    type: ProgramOperationTypes.Invocation;
    name_function: string;
    row_args: string[];
    row_output: string;
}
export interface InvocationOperation
{
    type: ProgramOperationTypes.Invocation;
    name_function: string;
    var_args: string[];
    var_output: string;
    type_output: DataTypes;
}

interface InvocationTreeOperationOptions
{
    type: ProgramOperationTypes.InvocationTree;
    name_function: string;
    row_args: string;
    row_output: string;
    zero_value: number;
}
export interface InvocationTreeOperation
{
    type: ProgramOperationTypes.InvocationTree;
    name_function: string;
    var_args: string[];
    var_output: string;
    type_output: DataTypes;
    zero_value: number;
}

type ProgramOperationOptionsMap =
{
    [ProgramOperationTypes.BinaryArithmetic]: BinaryArithmeticOperationOptions;
    [ProgramOperationTypes.Invocation]: InvocationOperationOptions;
    [ProgramOperationTypes.InvocationTree]: InvocationTreeOperationOptions;
    [ProgramOperationTypes.Return]: ReturnOperationOptions;
}

export type ProgramOperationOptions<O extends ProgramOperationTypes = ProgramOperationTypes> = 
    ProgramOperationOptionsMap[O];

type ProgramOperationMap =
{
    [ProgramOperationTypes.BinaryArithmetic]: BinaryArithmeticOperation;
    [ProgramOperationTypes.Invocation]: InvocationOperation;
    [ProgramOperationTypes.InvocationTree]: InvocationTreeOperation;
    [ProgramOperationTypes.Return]: ReturnOperation;
}

export type ProgramOperation<O extends ProgramOperationTypes = ProgramOperationTypes> = 
    ProgramOperationMap[O];