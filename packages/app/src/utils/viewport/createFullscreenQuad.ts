
const quad = new Float32Array([
    -1,  1,  0,
    -1, -1,  0,
     1, -1,  0,
     1,  1,  0,
]);

const quadIndices = new Uint16Array([ 3, 2, 1, 3, 1, 0 ]);
export const QUAD_INDICES_LENGTH = quadIndices.length;

export default function createFullScreenQuad(gl: WebGL2RenderingContext)
{
    const vertexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, quadIndices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return { vertexBuffer, indexBuffer };
}