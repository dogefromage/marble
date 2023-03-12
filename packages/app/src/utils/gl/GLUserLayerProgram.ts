import { FRAG_CODE_TEMPLATE, VERT_CODE_TEMPLATE } from "../../content/shaderTemplates";
import { LayerProgram, ProgramAttribute, ProgramUniform, UniformTypes } from "../../types";
import { CodeTemplate } from "../codeStrings";
import { degToRad } from "../math";
import { globalViewportUniforms } from "../viewportView/uniforms";
import GLIndexedBuffer from "./GLIndexedBuffer";
import GLProgram from "./GLProgram";
import GLTexture from "./GLTexture";

const userProgramUniforms: ProgramUniform[] = [
    globalViewportUniforms.inverseCamera,
    globalViewportUniforms.invScreenSize,
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

function generateShaders(layerProgram: LayerProgram) {
    const fragCodeTemplate = new CodeTemplate(FRAG_CODE_TEMPLATE);

    const includedCodeTotal = layerProgram.includes
        .map(i => i.source)
        .join('\n');
    fragCodeTemplate.replace('%INCLUDES%', includedCodeTotal);
    fragCodeTemplate.replace('%MAIN_PROGRAM%', layerProgram.programCode);
    fragCodeTemplate.replace('%ROOT_FUNCTION_NAME%', layerProgram.rootFunction);

    const fragCode = fragCodeTemplate.getFinishedCode(/%.*%/);
    // console.log(logCodeWithLines(fragCode));

    return {
        vertCode: VERT_CODE_TEMPLATE,
        fragCode,
    };
}

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
}
