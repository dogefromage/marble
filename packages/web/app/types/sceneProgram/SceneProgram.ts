import { MapEvery, ObjMap } from "../UtilityTypes";
import { ProgramOperation } from "./ProgramOperation";

export enum ProgramOperationTypes
{
    BinaryArithmetic = 'binary-arithmetic',
    InvocationTree = 'invocation-tree',
    Invocation = 'invocation',
    Return = 'return',
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
    Mat3 = 'mat3',
    Solid = 'Solid',
}

export const TEXTURE_VAR_DATATYPE_SIZE: MapEvery<DataTypes, number> =
{
    unknown: 0,
    float: 1,
    vec2: 2,
    vec3: 3,
    mat3: 9,
    Solid: 4,
}

export enum DefaultFunctionArgNames
{
    RayPosition = 'arg_ray_p'
}

export interface FunctionArg 
{
    name: DefaultFunctionArgNames;
    dataType: DataTypes;
}

export const DefaultFunctionArgs: FunctionArg[] = 
[
    {
        name: DefaultFunctionArgNames.RayPosition, 
        dataType: DataTypes.Vec3,
    },
];

export interface ProgramTextureVar
{
    dataType: DataTypes;
    name: string;
    textureCoordinate: number;
}

export interface ProgramTextureVarMapping
{
    dataTypes: DataTypes;
    textureCoordinate: number;
    nodeIndex: number;
    rowIndex: number;
}

export interface ProgramConstant
{
    name: string;
    dataType: DataTypes;
    value: any;
}

export interface ProgramInclude
{
    id: string;
    glslCode: string;
}

export interface IncrementalProgramMetadata
{
    constants: ProgramConstant[];
    textureVars: ProgramTextureVar[];
    textureVarMappings: ObjMap<ProgramTextureVarMapping>;
}

export interface GeometryProgramMethod
{
    geometryId: string;
    compilationValidity: number;
    methodName: string;
    functionArgs: FunctionArg[];
    includedTokens: string[];
    textureVarMappings: ObjMap<ProgramTextureVarMapping>;
    programInstructions: string[];
    methodReturnType: DataTypes;
}

export interface SceneProgram
{
    includes: ProgramInclude[];
    rootMethod: GeometryProgramMethod;
}