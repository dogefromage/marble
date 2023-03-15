import { setUniform, setVertexAttribPointer } from ".";
import { IDObj, ProgramAttribute, ProgramUniform } from "../../types";
import { Logger } from "../debug";
import { logCodeWithLines, logCodeWithLinesProximity } from "../debugging";
import GLIndexedBuffer from "./GLIndexedBuffer";
import GLTexture from "./GLTexture";

type ProgramState = 'compiling' | 'ready' | 'destroyed' | 'failed';

export default class GLProgram extends Logger implements IDObj {
    public state: ProgramState = 'compiling';
    public onReady?: () => void;
    
    private program!: WebGLProgram;
    private vertexShader!: WebGLShader;
    private fragmentShader!: WebGLShader;
    private finalizeInterval: any;

    private uniformData = new Map<string, number[]>();
    private uniformLocations = new Map<string, WebGLUniformLocation>();
    private attributeLocations = new Map<string, number>();
    private boundBuffers = new Map<string, GLIndexedBuffer>();
    private mainTexture?: GLTexture;
    public depthTest = true;

    constructor(
        protected gl: WebGL2RenderingContext,
        public id: string,
        public renderIndex: number,
        private vertCode: string, 
        private fragCode: string,
        private uniforms: ProgramUniform[],
        private attributes: ProgramAttribute[],
    ) {
        super();
        this.initializeCompilation(vertCode, fragCode);
    }

    public bindBuffer(attributeName: string, buffer: GLIndexedBuffer) {
        this.boundBuffers.set(attributeName, buffer);
    }
    public setTexture(texture: GLTexture) {
        this.mainTexture = texture;
    }

    public setUniformData(name: string, data: number[]) {
        this.uniformData.set(name, data);
    }

    private initializeCompilation(vertCode: string, fragCode: string) {
        const { gl } = this;
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
        this.finalizeInterval = setInterval(() => {
            if (finalizeGenerator.next().done) {
                clearInterval(this.finalizeInterval);
            }
        }, 50);
    }

    private *finalizeCompilation() {
        const { gl, program } = this;

        const ext = gl.getExtension('KHR_parallel_shader_compile');
        if (ext != null) {
            do {
                // suspend function while shader is compiling
                yield;
                if (this.state === 'destroyed') {
                    return; // clears the interval
                }
            }
            while (!gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR));
        }
        // ERRORS
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            this.info(`An error occured during compilation of GLProgram ${this.id}`);
            console.error(`Link failed: ${gl.getProgramInfoLog(program)}`);
            const vertError = gl.getShaderInfoLog(this.vertexShader);
            const fragError = gl.getShaderInfoLog(this.fragmentShader);
            if (vertError?.length) {
                this.logShaderError("Vertex error", this.vertCode, vertError);
            }
            if (fragError?.length) {
                this.logShaderError("Fragment error", this.fragCode, fragError);
            }
            this.state = 'failed';
            return;
        }
        // ATTRIBUTE LOCATIONS
        for (const attrib of this.attributes) {
            const location = gl.getAttribLocation(program, attrib.name);
            this.attributeLocations.set(attrib.name, location);
        }
        // UNIFORM LOCATIONS
        for (const uniform of this.uniforms) {
            const location = gl.getUniformLocation(program, uniform.name);
            if (location) {
                this.uniformLocations.set(uniform.name, location);
            } else {
                console.warn(`${this.id}: Uniform not found: ${uniform.name}`);
            }
        }
        this.state = 'ready';
        this.onReady?.();
        this.info(`Successfully compiled GLProgram ${this.id}`);
    }

    private logShaderError(shaderName: string, shaderCode: string, errorString: string) {
        console.error(shaderName + ": " + errorString);
        const match = errorString.match(/(\d+)(?::)(\d+)/);
        const errorLine = match?.[2];
        if (errorLine != null) {
            let line = parseInt(errorLine);
            console.error(logCodeWithLinesProximity(shaderCode, line, 5));
        } else {
            console.error(logCodeWithLines(shaderCode))
        }
    }
    
    public destroy() {
        const gl = this.gl;
        // gl.flush(); // maybe necessary
        this.state = 'destroyed';
        gl.flush();
        gl.deleteProgram(this.program);
        gl.deleteShader(this.vertexShader);
        gl.deleteShader(this.fragmentShader);
        this.info(`Destroyed GLProgram ${this.id}`);
    }

    public load(globalUniformData: Map<string, number[]>) {
        const { gl } = this;
        gl.useProgram(this.program);
        if (this.depthTest) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }

        if (this.mainTexture) {
            this.mainTexture.bind(gl);
        }

        for (const attribute of this.attributes) {
            const buffer = this.boundBuffers.get(attribute.name);
            if (!buffer) {
                console.error(`Buffer not bound onto attribute ${attribute.name}`);
                continue;
            }
            buffer.bind(gl);
            const location = this.attributeLocations.get(attribute.name);
            if (location != null) {
                setVertexAttribPointer(gl, attribute, location);
                gl.enableVertexAttribArray(location);
            } else {
                console.error(`Attribute location not found "${attribute.name}"`);
            }
        }

        for (const uniform of this.uniforms) {
            let data = this.uniformData.get(uniform.name) 
            data ||= globalUniformData.get(uniform.name);
            const location = this.uniformLocations.get(uniform.name);
            
            if (data != null && location != null) {
                setUniform(gl, location, uniform.type, data);
            } else if (!data) {
                console.warn(`${this.id}: Uniform data for "${uniform.name}" not set`);
            } else if (!location) {
                console.warn(`${this.id}: Uniform location for "${uniform.name}" not found`);
            }
        }
    }

    public draw() {        
        for (const buffer of this.boundBuffers.values()) {
            buffer.drawElements(this.gl);
        }
    }
}