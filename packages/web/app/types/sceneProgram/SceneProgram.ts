
export enum ProgramOperationTypes
{
    Arithmetic = 'arithmetic',
    Call = 'call',
    Output = 'output',
}

export enum ArithmeticOperations
{
    Add = 'add',
    Subtract = 'subtract',
    Multiply = 'multiply',
    Divide = 'divide',
}

export enum DataTypes
{
    Unknown = 'unknown',
    Float = 'float',
    Float3 = 'vec3',
}

export interface ProgramOutputOperation
{
    type: ProgramOperationTypes.Output;
    input: string;

    /**
     *        [element]
     * return xy       ;
     */
}

export interface ProgramArithmeticOperation
{
    type: ProgramOperationTypes.Arithmetic;
    lhs: string;
    rhs: string;
    outputElement: string | null;
    outputDatatype: DataTypes;
    operation: ArithmeticOperations;
    
    /**
     * [dt_out] [el_out]   [lhs] [operation] [rhs]
     * float    c        = a     *           b    ;
     */
}

export interface ProgramCallOperation
{
    type: ProgramOperationTypes.Call;
    outputElement: string | null;
    outputDatatype: DataTypes;
    arguments: string[];
    functionName: string;

    /**
     * [dt_out] [el_out] [fn] [el_in]
     * float    y =      f(   x      );
     */
}

export type ProgramOperation =
    | ProgramOutputOperation
    | ProgramArithmeticOperation 
    | ProgramCallOperation

export interface ProgramConstant
{
    value: number | number[];
    symbol: string;
}

export interface SceneProgram
{
    constants: ProgramConstant[];
    operations: ProgramOperation[];
}