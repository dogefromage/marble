import { defaultViewportUniforms, ObjMap, ProgramUniform } from "../../types";
import createFullScreenQuad, { QUAD_INDICES_LENGTH } from "./createFullscreenQuad";
import { GLProgram } from "./GLProgram";

export const LOOKUP_TEXTURE_WIDTH = 16;

export default class GLProgramRenderer {

    private vertexBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer;
    private varTexture: WebGLTexture;
    private uniforms: ObjMap<ProgramUniform> = defaultViewportUniforms;
    private isRendering = false;

    constructor(
        private gl: WebGL2RenderingContext,
    ) {
        const buffers = createFullScreenQuad(gl);
        this.vertexBuffer = buffers.vertexBuffer;
        this.indexBuffer = buffers.indexBuffer;

        // const testData = new Float32Array(LOOKUP_TEXTURE_SIZE * LOOKUP_TEXTURE_SIZE).fill(0.5);
        this.varTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.varTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,            // level
            gl.R16F, // internal format
            LOOKUP_TEXTURE_WIDTH,
            LOOKUP_TEXTURE_WIDTH,
            0,            // border
            gl.RED, // format
            gl.FLOAT,  // type
            null
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    public setUniformData(name: string, data: number[]) {
        const uniform = this.uniforms[ name ];
        if (!uniform) {
            console.error(`uniform not found: ${name}`);
        }
        uniform.data = data;
    }

    public setVarTextureRow(rowIndex: number, row: number[]) {
        if (row.length != LOOKUP_TEXTURE_WIDTH) {
            throw new Error(`Length wrong`);
        }
        const gl = this.gl;
        const typedArr = new Float32Array(row);
        gl.bindTexture(gl.TEXTURE_2D, this.varTexture);
        gl.texSubImage2D(
            gl.TEXTURE_2D,
            0, // level
            0, // x off
            rowIndex, // y off
            LOOKUP_TEXTURE_WIDTH, // width
            1, // height
            gl.RED,
            gl.FLOAT,
            typedArr,
        );
    }

    public requestRender(programs: GLProgram[]) {
        if (this.isRendering) {
            return;
        }
        requestAnimationFrame(() => this.render(programs));
        this.isRendering = true;
    }

    private render(programs: GLProgram[]) {
        this.isRendering = false;
        const gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, this.varTexture);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        
        for (const program of programs) {
            if (program.state === 'ready') {
                program.useProgram(this.uniforms);
                gl.drawElements(gl.TRIANGLES, QUAD_INDICES_LENGTH, gl.UNSIGNED_SHORT, 0);
            }
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}