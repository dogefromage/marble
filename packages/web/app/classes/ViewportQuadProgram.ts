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
    private vertexShader: WebGLShader;
    private fragmentShader: WebGLShader;

    private isRendering = false;
    private isCompiling = false;

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

        const testData = new Float32Array(LOOKUP_TEXTURE_SIZE * LOOKUP_TEXTURE_SIZE).fill(0.5);

        this.varTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.varTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,            // level
            gl.R16F, // internal format
            LOOKUP_TEXTURE_SIZE,
            LOOKUP_TEXTURE_SIZE,
            0,            // border
            gl.RED, // format
            gl.FLOAT,  // type
            testData,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    }

    loadProgram(vertCode: string, fragCode: string)
    {
        this.isCompiling = true;

        const gl = this.gl;

        gl.flush();

        gl.deleteProgram(this.currentProgram);
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);

        const program = gl.createProgram()!;
        this.currentProgram = program;

        this.vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;

        gl.shaderSource(this.fragmentShader, fragCode);
        gl.shaderSource(this.vertexShader, vertCode);

        gl.compileShader(this.vertexShader);
        gl.compileShader(this.fragmentShader);

        gl.attachShader(program, this.vertexShader);
        gl.attachShader(program, this.fragmentShader);
        gl.linkProgram(program);
        
        const finalizeGen = this.finalizeLoading();

        const interval = setInterval(() =>
        {
            if (finalizeGen.next().done) 
                clearInterval(interval);
        }, 50);
    }

    private *finalizeLoading()
    {
        const gl = this.gl;
        const program = this.currentProgram!;

        const ext = gl.getExtension('KHR_parallel_shader_compile');

        if (ext)
        {
            while (!gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR))
            {
                /**
                 * suspend function while shader is compiling
                 */
                yield;
            }
        }
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        {
            console.error(`Link failed: ${gl.getProgramInfoLog(program)}`);

            console.error(gl.getShaderInfoLog(this.fragmentShader));
            console.error(gl.getShaderInfoLog(this.vertexShader));
        }

        this.attributeLocations.buffer = gl.getAttribLocation(program, "position");

        Object.entries(this.uniforms).forEach(([ key, uniform ]) =>
        {
            const location = gl.getUniformLocation(program, key);
            if (location == null) console.warn(`Uniform not found in program: ${key}`);

            uniform.location = location;
        });

        this.isCompiling = false;

        this.requestRender();
    }
    
    setUniformData(name: string, data: number[])
    {
        if (this.uniforms?.[ name ])
            this.uniforms[ name ].data = data;
    }

    setVarTextureData(data: number[])
    {
        const gl = this.gl;

        const typedArr = new Float32Array(data);

        gl.bindTexture(gl.TEXTURE_2D, this.varTexture);
        gl.texSubImage2D(
            gl.TEXTURE_2D,
            0, 0, 0,
            LOOKUP_TEXTURE_SIZE,
            LOOKUP_TEXTURE_SIZE,
            gl.RED,
            gl.FLOAT,
            typedArr,
        );
    }

    requestRender()
    {
        if (this.isRendering) return;
        requestAnimationFrame(() => this.render());
        this.isRendering = true;
    }

    private render()
    {
        this.isRendering = false;

        const gl = this.gl;
        const program = this.currentProgram;

        if (!program || this.isCompiling) return;

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
