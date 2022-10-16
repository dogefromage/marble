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
    private varTexture: WebGLTexture;

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

        const testData = new Float32Array(LOOKUP_TEXTURE_SIZE * LOOKUP_TEXTURE_SIZE).fill(2);

        this.varTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.varTexture);
        gl.texImage2D(
           gl.TEXTURE_2D, 
           0,            // level
           gl.RGBA, // internal format
           LOOKUP_TEXTURE_SIZE,
           LOOKUP_TEXTURE_SIZE,
           0,            // border
           gl.RED, // format
           gl.FLOAT,  // type
           testData,
        );
        // gl.texImage2D(
        //    gl.TEXTURE_2D, 
        //    0,            // level
        //    gl.R32F, // internal format
        //    LOOKUP_TEXTURE_SIZE,
        //    LOOKUP_TEXTURE_SIZE,
        //    0,            // border
        //    gl.RED, // format
        //    gl.FLOAT,  // type
        //    testData,
        // );  
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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
            if (location == null) throw new Error(`Uniform not found in program: ${key}`);

            uniform.location = location;
        });

        requestAnimationFrame(() => this.render());
    }

    setUniformData(name: string, data: number[])
    {
        if (this.uniforms?.[name])
            this.uniforms[name].data = data;
    }

    setVarTextureData(data: number[])
    // setVarTextureData(data: Float32Array)
    {
        // const gl = this.gl;
        
        // const typedArr = new Float32Array(data);

        // gl.bindTexture(gl.TEXTURE_2D, this.varTexture);
        // gl.texSubImage2D(
        //     gl.TEXTURE_2D, 
        //     0,
        //     0, 0,
        //     LOOKUP_TEXTURE_SIZE,
        //     LOOKUP_TEXTURE_SIZE,
        //     gl.RED,
        //     gl.FLOAT,
        //     typedArr,
        // );
    }

    render()
    {
        const gl = this.gl;
        const program = this.currentProgram;

        if (!program) return;

        gl.useProgram(program);

        gl.bindTexture(gl.TEXTURE_2D, this.varTexture);
        
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
