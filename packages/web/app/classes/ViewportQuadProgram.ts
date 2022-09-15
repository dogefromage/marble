import { mat4, vec3 } from "gl-matrix";
import { fragmentCode, vertexCode } from "../components/ViewportShaders";
import { KeyValueMap } from "../types/utils";
import { ProgramUniform } from "../types/Viewport";
import checkShaderError from "../utils/gl/checkShaderError";
import createFullScreenQuad, { QUAD_INDICES_LENGTH } from "../utils/gl/createFullscreenQuad";
import { setUniform, UniformTypes } from "../utils/gl/setUniform";

interface RuntimeUniform extends ProgramUniform
{
    location: WebGLUniformLocation;
}

export class ViewportQuadProgram
{
    private program: WebGLProgram;
    private vertexBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer;

    private uniforms: KeyValueMap<RuntimeUniform> = {} 

    constructor(
        private gl: WebGL2RenderingContext,
        uniforms: ProgramUniform[],
    )
    {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vertexShader, vertexCode);
        gl.compileShader(vertexShader);
        checkShaderError(gl, 'vertex shader', vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fragmentShader, fragmentCode);
        gl.compileShader(fragmentShader);
        checkShaderError(gl, 'fragment shader', fragmentShader);

        const program = gl.createProgram()!;
        this.program = program;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const positionLocation = gl.getAttribLocation(program, "position");

        const buffers = createFullScreenQuad(gl, positionLocation);
        this.vertexBuffer = buffers.vertexBuffer;
        this.indexBuffer = buffers.indexBuffer;

        uniforms.forEach(programUniform =>
        {
            const location = gl.getUniformLocation(program, programUniform.name);
            if (!location) throw new Error(`Uniform not found in program: ${programUniform.name}`);

            this.uniforms[programUniform.name] =
            {
                ...programUniform,
                location,
            };
        })

        console.log('Program created');
    }

    setUniformData(name: string, data: number[])
    {
        this.uniforms[name].data = data;
    }

    render()
    {
        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        for (const uniform of Object.values(this.uniforms))
        {
            setUniform(gl, uniform.location, uniform.type, uniform.data);
        }

        gl.drawElements(gl.TRIANGLES, QUAD_INDICES_LENGTH, gl.UNSIGNED_SHORT, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        
        console.log('Program rendered')
    }
}
