import { ObjMap } from "../types/utils";
import { ProgramUniform } from "../types/viewport";
import checkShaderError from "../utils/viewport/checkShaderError";
import createFullScreenQuad, { QUAD_INDICES_LENGTH } from "../utils/viewport/createFullscreenQuad";
import { setUniform } from "../utils/viewport/setUniform";

export const LOOKUP_TEXTURE_SIZE = 4;

export class ViewportQuadProgram
{
    private currentProgram: WebGLProgram | null = null;
    private vertexBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer;

    public attributeLocations: {
        buffer?: number;
    } = {};

    constructor(
        private gl: WebGL2RenderingContext,
        private uniforms: ObjMap<ProgramUniform>,
    )
    {
        const buffers = createFullScreenQuad(gl);
        this.vertexBuffer = buffers.vertexBuffer;
        this.indexBuffer = buffers.indexBuffer;
    }

    setProgram(vertCode: string, fragCode: string)
    {
        const gl = this.gl;

        const program = gl.createProgram()!;
        this.currentProgram = program;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vertexShader, vertCode);
        gl.compileShader(vertexShader);
        checkShaderError(gl, 'vertex shader', vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fragmentShader, fragCode);
        gl.compileShader(fragmentShader);
        checkShaderError(gl, 'fragment shader', fragmentShader);

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        
        this.attributeLocations.buffer = gl.getAttribLocation(program, "position");

        gl.useProgram(program);
    
        Object.entries(this.uniforms).forEach(([ key, uniform ]) =>
        {
            const location = gl.getUniformLocation(program, key);
            if (!location) throw new Error(`Uniform not found in program: ${key}`);

            uniform.location = location;
        });

        requestAnimationFrame(() => this.render());
    }

    setUniformData(name: string, data: number[])
    {
        if (this.uniforms?.[name])
            this.uniforms[name].data = data;
    }

    render()
    {
        const gl = this.gl;
        const program = this.currentProgram;

        if (!program) return;

        gl.useProgram(program);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.vertexAttribPointer(this.attributeLocations.buffer!, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attributeLocations.buffer!);

        for (const uniform of Object.values(this.uniforms))
        {
            if (!uniform.location) continue;
            setUniform(gl, uniform.location, uniform.type, uniform.data);
        }

        gl.drawElements(gl.TRIANGLES, QUAD_INDICES_LENGTH, gl.UNSIGNED_SHORT, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}
