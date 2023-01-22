import createFullScreenQuad from "./createFullscreenQuad";


export default class GLProgramRenderer {

    private vertexBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer;
    private varTexture: WebGLTexture;
    
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

        this.vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    }
}