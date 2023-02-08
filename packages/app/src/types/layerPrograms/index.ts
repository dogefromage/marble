import { MapEvery, Tuple } from "../UtilityTypes";

export type DataTypes = 'unknown' | 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat3' | 'Solid';

export interface DataTypeValueTypes {
    unknown: number;
    float:   number;
    vec2:    Tuple<number, 2>;
    vec3:    Tuple<number, 3>;
    vec4:    Tuple<number, 4>;
    mat3:    Tuple<number, 9>;
    Solid:   Tuple<number, 4>;
}

export const FAR_AWAY = 100000.0;

export const defaultDataTypeValue: { [D in DataTypes]: DataTypeValueTypes[D] } = {
    unknown: 0,
    float:   0,
    vec2:  [ 0, 0 ],
    vec3:  [ 0, 0, 0 ],
    vec4:  [ 0, 0, 0, 0 ],
    mat3:  [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ],
    Solid: [ FAR_AWAY, 0, 0, 0 ],
}

export const textureVarDatatypeSize: MapEvery<DataTypes, number> = {
    unknown: 0,
    float: 1,
    vec2: 2,
    vec3: 3,
    vec4: 4,
    mat3: 9,
    Solid: 4,
}

export interface ProgramTextureVarMapping {
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