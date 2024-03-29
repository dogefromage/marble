import { Tuple } from "../UtilityTypes";

export type DataTypes = 'Distance' | 'number' | 'boolean' | 'vec2' | 'vec3' | 'vec4' | 'mat3';


// export interface DataTypeValueTypes {
//     bool:  number;
//     int:   number;
//     float: number;
//     vec2:  Tuple<number, 2>;
//     vec3:  Tuple<number, 3>;
//     vec4:  Tuple<number, 4>;
//     mat3:  Tuple<number, 9>;
// }

// export const LOOKUP_TEXTURE_WIDTH = 256;

// export interface ProgramDynamicLookupMapping {
//     dataType: DataTypes;
//     textureCoordinate: number;
//     geometryId: string;
//     geometryVersion: number;
//     nodeIndex: number;
//     rowIndex: number;
// }

export interface LayerProgram {
    id: string;
    name: string;
    drawIndex: number;
    // hash: number;
    programCode: string;
    entryFunctionName: string;
    // textureVarMappings: ProgramDynamicLookupMapping[];
    // textureVarRowIndex: number;
    // textureVarRow: number[];
}
