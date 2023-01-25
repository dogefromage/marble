import { degToRad } from "../../utils/math";
import { ObjMap } from "../UtilityTypes";

export enum UniformTypes
{
    Uniform1ui,
    Uniform2ui,
    Uniform3ui,
    Uniform4ui,
    Uniform1fv,
    Uniform2fv,
    Uniform3fv,
    Uniform4fv,
    Uniform1iv,
    Uniform2iv,
    Uniform3iv,
    Uniform4iv,
    Uniform1uiv,
    Uniform2uiv,
    Uniform3uiv,
    Uniform4uiv,
    UniformMatrix2fv,
    UniformMatrix3x2fv,
    UniformMatrix4x2fv,
    UniformMatrix2x3fv,
    UniformMatrix3fv,
    UniformMatrix4x3fv,
    UniformMatrix2x4fv,
    UniformMatrix3x4fv,
    UniformMatrix4fv,
}

export interface ProgramUniform
{
    type: UniformTypes;
    data?: number[];
}

export const defaultViewportUniforms: ObjMap<ProgramUniform> = {
    'inverseCamera': {
        type: UniformTypes.UniformMatrix4fv,
        // data: new Array(16).fill(0),
    },
    'invScreenSize': {
        type: UniformTypes.Uniform2fv,
        // data: [ 0, 0 ],
    },
    'marchParameters': {
        type: UniformTypes.Uniform3fv,
        data: [ 100, 0, 0.001 ], // has no effect only default
    },
    'ambientColor': {
        type: UniformTypes.Uniform3fv,
        data: [ 0.03, 0.03, 0.07 ],
    },
    'sunColor': {
        type: UniformTypes.Uniform3fv,
        data: [ 1, 0.9, 0.7 ],
    },
    'sunGeometry': {
        type: UniformTypes.Uniform4fv,
        data: [ 0.312347, 0.15617376, 0.93704257, degToRad(3) ],
    },
}