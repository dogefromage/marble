import { ProgramUniform, UniformTypes } from "../../types";
import { glsl } from "../codeStrings";

// const cameraStructDefinition = glsl`
// struct Camera {
//     transform
// };
// uniform camera Camera;
// `;

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
