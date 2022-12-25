
export default function checkShaderError(gl: WebGL2RenderingContext, shaderName: string, shader: WebGLShader)
{
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    {
        console.warn('ERROR IN SHADER: ' + shaderName);
        console.error(gl.getShaderInfoLog(shader));
    }
}