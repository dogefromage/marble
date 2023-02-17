import { MapEvery, Tuple } from "../UtilityTypes";

export * from './lambda';
 
export type BaseDataTypes = 'unknown' | 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat3' | 'SignedDistance';
export type LambdaDataTypes = 'Surface';
export type DataTypes = BaseDataTypes | LambdaDataTypes;

type SimpleTypeDescriptor<D extends DataTypes> = {
    type: 'simple';
    keyword: D;
}
type StructTypeDescriptor<D extends DataTypes, A extends DataTypes[]> = {
    type: 'struct';
    identifier: D;
    attributes: A;
}
type LambdaTypeDescriptor<R extends DataTypes, P extends DataTypes[]> = {
    type: 'lambda';
    returnType: R;
    parameterTypes: P;
}
export type DataTypeDescriptor =
    | SimpleTypeDescriptor<'unknown'>
    | SimpleTypeDescriptor<'float'>
    | SimpleTypeDescriptor<'vec2'>
    | SimpleTypeDescriptor<'vec3'>
    | SimpleTypeDescriptor<'vec4'>
    | SimpleTypeDescriptor<'mat3'>
    | StructTypeDescriptor<'SignedDistance', [ 'float', 'vec3' ]>
    | LambdaTypeDescriptor<'SignedDistance', [ 'vec3' ]>

export const dataTypeDescriptors: { [D in DataTypes]: DataTypeDescriptor } = {
    unknown:        { type: 'simple', keyword: 'unknown' },
    float:          { type: 'simple', keyword: 'float' },
    vec2:           { type: 'simple', keyword: 'vec2' },
    vec3:           { type: 'simple', keyword: 'vec3' },
    vec4:           { type: 'simple', keyword: 'vec4' },
    mat3:           { type: 'simple', keyword: 'mat3' },
    SignedDistance: { type: 'struct', identifier: 'SignedDistance', attributes: [ 'float', 'vec3' ] },
    Surface:        { type: 'lambda', returnType: 'SignedDistance', parameterTypes: [ 'vec3' ] },
}

export interface DataTypeValueTypes {
    unknown:          number;
    float:            number;
    vec2:             Tuple<number, 2>;
    vec3:             Tuple<number, 3>;
    vec4:             Tuple<number, 4>;
    mat3:             Tuple<number, 9>;
    SignedDistance: [ number, Tuple<number, 3> ];
    Surface:          null;
}

export const FAR_DISTANCE = 100000.0;

export const initialDataTypeValue: { [D in DataTypes]: DataTypeValueTypes[D] } = {
    unknown:          0,
    float:            0,
    vec2:           [ 0, 0 ],
    vec3:           [ 0, 0, 0 ],
    vec4:           [ 0, 0, 0, 0 ],
    mat3:           [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ],
    SignedDistance: [ FAR_DISTANCE, [ 0, 0, 0 ] ],
    Surface:          null,
}

export const textureVarDatatypeSize: MapEvery<DataTypes, number> = {
    float:           1,
    vec2:            2,
    vec3:            3,
    vec4:            4,
    mat3:            9,
    // not dynamic
    SignedDistance: -1,
    unknown:        -1,
    Surface:        -1,
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
