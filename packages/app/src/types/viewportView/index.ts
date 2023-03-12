import { quat, vec2, vec3 } from "gl-matrix";
import { PanelState } from "../panelManager";

export interface ViewportCamera {
    target: vec3;
    rotation: vec2;
    distance: number;
    fov: number;
}

export interface RenderCamera {
    position: vec3;
    rotation: quat;
    fov: number;
}

export interface ViewportPanelState extends PanelState {
    uniformSources: {
        viewportCamera: ViewportCamera;
        maxIterations: number;
    }
}
export interface ProgramUniform {
    name: string;
    type: UniformTypes;
}

export interface ProgramAttribute {
    name: string;
    type: 'vec3',
}

export enum UniformTypes {
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
