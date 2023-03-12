import { ProgramUniform, UniformTypes } from "../../types";

const inverseCamera: ProgramUniform = {
    name: 'inverseCamera',
    type: UniformTypes.UniformMatrix4fv,
};

const invScreenSize: ProgramUniform = {
    name: 'invScreenSize',
    type: UniformTypes.Uniform2fv,
};

const cameraTarget: ProgramUniform = {
    name: 'cameraTarget',
    type: UniformTypes.Uniform3fv,
}

const cameraDistance: ProgramUniform = {
    name: 'cameraDistance',
    type: UniformTypes.Uniform1fv,
}

export const globalViewportUniforms = {
    inverseCamera,
    invScreenSize,
    cameraTarget,
    cameraDistance,
} as const;
