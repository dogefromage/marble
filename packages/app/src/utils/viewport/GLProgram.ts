import { defaultViewportUniforms, ObjMap, ProgramUniform } from "../../types";
import { setUniform } from "./setUniform";

type ProgramState = 'compiling' | 'ready' | 'destroyed' | 'failed';

export class GLProgram
{
    public state: ProgramState = 'compiling';

    private program: WebGLProgram;
    private vertexShader: WebGLShader;
    private fragmentShader: WebGLShader;
    private attribLocations = {
        position: -1,
    };
    private uniformLocations = new Map<string, WebGLUniformLocation>();
    public onReady?: () => void;

    constructor(
        private gl: WebGL2RenderingContext,
        private id: string,
        vertCode: string, 
        fragCode: string,
    ) {
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(this.fragmentShader, fragCode);
        gl.shaderSource(this.vertexShader, vertCode);
        gl.compileShader(this.vertexShader);
        gl.compileShader(this.fragmentShader);

        const program = gl.createProgram()!;
        this.program = program;
        gl.attachShader(program, this.vertexShader);
        gl.attachShader(program, this.fragmentShader);
        gl.linkProgram(program);
        
        const finalizeGenerator = this.finalizeCompilation();
        const interval = setInterval(() => {
            if (finalizeGenerator.next().done) {
                clearInterval(interval);
            }
        }, 50);
    }

    private *finalizeCompilation() {
        const { gl, program } = this;

        const ext = gl.getExtension('KHR_parallel_shader_compile');
        if (ext != null) {
            while (!gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)) {
                // suspend function while shader is compiling
                yield;
            }
        }
        // ERRORS
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            // console.info(`An error occured during compilation of GLProgram ${this.id}`);
            console.error(`Link failed: ${gl.getProgramInfoLog(program)}`);
            console.error(gl.getShaderInfoLog(this.fragmentShader));
            console.error(gl.getShaderInfoLog(this.vertexShader));
            this.state = 'failed';
            return;
        }
        // ATTRIBUTE LOCATIONS
        for (const attrib of Object.keys(this.attribLocations)) {
            const loc = gl.getAttribLocation(program, attrib);
            this.attribLocations[attrib as keyof typeof this.attribLocations] = loc;
        }
        // UNIFORM LOCATIONS
        for (const uniform of Object.keys(defaultViewportUniforms)) {
            const location = gl.getUniformLocation(program, uniform);
            if (location == null) {
                console.warn(`Uniform not found in program ${this.id}: ${uniform}`);
                return;
            }
            this.uniformLocations.set(uniform, location);
        }
        this.state = 'ready';
        this.onReady?.();

        // console.info(`Successfully compiled GLProgram ${this.id}`);
    }
    
    public destroy() {
        const gl = this.gl;
        this.state = 'destroyed';
        // gl.flush(); // maybe necessary
        gl.deleteProgram(this.program);
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);
        // console.info(`Destroyed GLProgram ${this.id}`);
    }

    public useProgram(uniforms: ObjMap<ProgramUniform>) {
        const { gl } = this;

        gl.useProgram(this.program);

        gl.vertexAttribPointer(this.attribLocations.position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribLocations.position);
        
        for (const [ name, { type, data } ] of Object.entries(uniforms)) {
            const uniformLocation = this.uniformLocations.get(name);
            if (!uniformLocation || !data) {
                console.error(`Uniform ${name} could not be set`);
                continue;
            }
            setUniform(gl, uniformLocation, type, data);
        }

    }
}
