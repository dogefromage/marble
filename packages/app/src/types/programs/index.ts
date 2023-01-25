import { MapEvery } from "../UtilityTypes";

export enum DataTypes {
    Unknown = 'unknown',
    Float = 'float',
    Vec2 = 'vec2',
    Vec3 = 'vec3',
    Mat3 = 'mat3',
    Solid = 'Solid',
}

export const TEXTURE_VAR_DATATYPE_SIZE: MapEvery<DataTypes, number> = {
    unknown: 0,
    float: 1,
    vec2: 2,
    vec3: 3,
    mat3: 9,
    Solid: 4,
}

export interface ProgramTextureVarMapping
{
    dataType: DataTypes;
    textureCoordinate: number;
    geometryId: string;
    geometryVersion: number;
    nodeIndex: number;
    rowIndex: number;
}

export interface ProgramInclude {
    id: string;
    source: string;
}

export interface LayerProgram {
    id: string;
    index: number;
    hash: number;
    name: string;
    includes: ProgramInclude[];
    mainProgramCode: string;
    rootFunctionName: string;
    textureVarMappings: ProgramTextureVarMapping[];
    textureVarRowIndex: number;
    textureVarRow: number[];
}