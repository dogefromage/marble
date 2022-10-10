import { MapEvery, ObjMap } from "../utils";

export enum ProgramOperationTypes
{
    Arithmetic = 'arithmetic',
    Call = 'call',
    Output = 'output',
}

export enum ArithmeticOperations
{
    Add = '+',
    Subtract = '-',
    Multiply = '*',
    Divide = '/',
}

export enum DataTypes
{
    Unknown = 'unknown',
    Float = 'float',
    Vec2 = 'vec2',
    Vec3 = 'vec3',
}

export const DATA_TYPE_TEXTURE_OCCUPATION: MapEvery<DataTypes, number> =
{
    unknown: 0,
    float: 1,
    vec2: 2,
    vec3: 3,
}

export interface FunctionArg 
{
    name: string;
    dataType: DataTypes;
}

export enum DefaultFunctionArgNames
{
    RayPosition = 'arg_ray_p'
}

export const DefaultFunctionArgs: FunctionArg[] = 
[
    {
        name: DefaultFunctionArgNames.RayPosition, 
        dataType: DataTypes.Vec3,
    },
];

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
    functionArgs: string[];
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

export interface ProgramTextureVar
{
    // value: any;
    name: string;
    dataType: DataTypes;
    textureCoordinate: number;
}

// export interface ProgramTextureVarMapping
// {
//     dataTypes: DataTypes;
//     textureCoordinate: number;
//     dataLength: number;
// }

export interface SceneProgram
{
    includedGLSLCode: string[];
    methodName: string;
    functionArgs: FunctionArg[];
    textureVars: ProgramTextureVar[];
    // lkdfjlköasdflkj: ObjMap<ObjMap<ProgramTextureVarMapping>>;
    operations: ProgramOperation[];
    methodReturnType: DataTypes;
}

export interface GLSLSnippet
{
    id: string;
    code: string;
}