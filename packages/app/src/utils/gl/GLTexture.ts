
export default class GLTexture {

    constructor(
        private texture: WebGLTexture
    ) {}

    public bind(gl: WebGL2RenderingContext) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
}