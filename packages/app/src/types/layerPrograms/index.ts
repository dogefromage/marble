import { ListTypeSpecifier, Primitives, TypeSpecifier } from "@marble/language";
import { Tuple } from "../UtilityTypes";

export type ConstructedTypes = 'vec2' | 'vec3' | 'vec4' | 'mat3';
export type DataTypes = Primitives | ConstructedTypes;

export const dataTypeDescriptors: Record<DataTypes, TypeSpecifier> = {
    // primitives
    bool:  { type: 'primitive', primitive: 'bool' },
    int:   { type: 'primitive', primitive: 'int' },
    float: { type: 'primitive', primitive: 'float' },
    // constructed
    vec2:  { type: 'reference', name: 'vec2' },
    vec3:  { type: 'reference', name: 'vec3' },
    vec4:  { type: 'reference', name: 'vec4' },
    mat3:  { type: 'reference', name: 'mat3' },
}

const createFloatList = (length: number): ListTypeSpecifier => ({ 
    type: 'list', 
    length, 
    elementType: dataTypeDescriptors.float, 
});
export const dataTypeDefinitions: Record<ConstructedTypes, TypeSpecifier> = {
    vec2: createFloatList(2),
    vec3: createFloatList(3),
    vec4: createFloatList(4),
    mat3: createFloatList(9),
}

export interface DataTypeValueTypes {
    bool:  number;
    int:   number;
    float: number;
    vec2:  Tuple<number, 2>;
    vec3:  Tuple<number, 3>;
    vec4:  Tuple<number, 4>;
    mat3:  Tuple<number, 9>;
}

export const LOOKUP_TEXTURE_WIDTH = 256;

export interface ProgramDynamicLookupMapping {
    dataType: DataTypes;
    textureCoordinate: number;
    geometryId: string;
    geometryVersion: number;
    nodeIndex: number;
    rowIndex: number;
}

export interface LayerProgram {
    id: string;
    name: string;
    drawIndex: number;
    hash: number;
    programCode: string;
    rootFunction: string;
    textureVarMappings: ProgramDynamicLookupMapping[];
    textureVarRowIndex: number;
    textureVarRow: number[];
}
