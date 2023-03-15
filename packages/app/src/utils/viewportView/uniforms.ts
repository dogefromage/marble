import { ProgramUniform, UniformTypes } from "../../types";
import { glsl } from "../codeStrings";

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

const cameraDirection: ProgramUniform = {
    name: 'cameraDirection',
    type: UniformTypes.Uniform3fv,
}

const cameraDistance: ProgramUniform = {
    name: 'cameraDistance',
    type: UniformTypes.Uniform1fv,
}

const cameraNear: ProgramUniform = {
    name: 'cameraNear',
    type: UniformTypes.Uniform1fv,
}

const cameraFar: ProgramUniform = {
    name: 'cameraFar',
    type: UniformTypes.Uniform1fv,
}

export const globalViewportUniforms = {
    inverseCamera,
    invScreenSize,
    cameraTarget,
    cameraDistance,
    cameraDirection,
    cameraNear,
    cameraFar,
} as const;
