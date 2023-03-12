
export default class GLIndexedBuffer {
    constructor(
        private vertexBuffer: WebGLBuffer,
        private indexBuffer: WebGLBuffer,
        private indexBufferSize: number,
    ) {}

    public bind(gl: WebGL2RenderingContext) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }

    public drawElements(gl: WebGL2RenderingContext) {
        gl.drawElements(gl.TRIANGLES, this.indexBufferSize, gl.UNSIGNED_SHORT, 0);
    }

    public static createFullScreenQuad(gl: WebGL2RenderingContext) {
        const quad = new Float32Array([
            -1,  1,  0,
            -1, -1,  0,
            1, -1,  0,
            1,  1,  0,
        ]);
        const quadIndices = new Uint16Array([ 3, 2, 1, 3, 1, 0 ]);

        const vertexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, quadIndices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return new GLIndexedBuffer(vertexBuffer, indexBuffer, quadIndices.length);
    }
}