import { LayerProgram, ProgramAttribute, ProgramUniform, UniformTypes } from "../../types";
import { degToRad } from "../math";
import { globalViewportUniforms } from "../viewportView/uniforms";
import GLIndexedBuffer from "./GLIndexedBuffer";
import GLProgram from "./GLProgram";
import GLTexture from "./GLTexture";

const userProgramUniforms: ProgramUniform[] = [
    globalViewportUniforms.inverseCamera,
    globalViewportUniforms.invScreenSize,
    globalViewportUniforms.cameraDirection,
    globalViewportUniforms.cameraNear,
    globalViewportUniforms.cameraFar,
    {
        name: 'marchParameters',
        type: UniformTypes.Uniform3fv,
    },
    {
        name: 'ambientColor',
        type: UniformTypes.Uniform3fv,
    },
    {
        name: 'sunColor',
        type: UniformTypes.Uniform3fv,
    },
    {
        name: 'sunGeometry',
        type: UniformTypes.Uniform4fv,
    },
];

const userProgramAttributes: ProgramAttribute[] = [
    {
        name: 'position',
        type: 'vec3',
    }
]

export default class GLUserLayerProgram extends GLProgram {
    public layerProgram: LayerProgram;

    constructor(
        gl: WebGL2RenderingContext,
        layerProgram: LayerProgram,
        fullScreenQuad: GLIndexedBuffer,
        varTexture: GLTexture,
    ) {
        const { vertCode, fragCode } = generateShaders(layerProgram);
        super(gl, layerProgram.id, layerProgram.drawIndex, vertCode, fragCode, userProgramUniforms, userProgramAttributes);
        this.layerProgram = layerProgram;

        this.bindBuffer('position', fullScreenQuad);
        this.setTexture(varTexture);

        this.setUniformData('ambientColor', [0.03, 0.03, 0.07]);
        this.setUniformData('sunColor', [1, 0.9, 0.7]);
        this.setUniformData('sunGeometry', [0.312347, 0.15617376, 0.93704257, degToRad(3)]);
    }
    
    public load(globalUniformData: Map<string, number[]>): void {
        const { gl } = this;
        super.load(globalUniformData);

        // gl.enable(gl.DEPTH_TEST);
        // gl.depthFunc(gl.ALWAYS);
        // gl.depthMask(true);
    }
}
