
export enum UniformTypes
{
    Uniform1ui,
    Uniform2ui,
    Uniform3ui,
    Uniform4ui,
    Uniform1fv,
    Uniform2fv,
    Uniform3fv,
    Uniform4fv,
    Uniform1iv,
    Uniform2iv,
    Uniform3iv,
    Uniform4iv,
    Uniform1uiv,
    Uniform2uiv,
    Uniform3uiv,
    Uniform4uiv,
    UniformMatrix2fv,
    UniformMatrix3x2fv,
    UniformMatrix4x2fv,
    UniformMatrix2x3fv,
    UniformMatrix3fv,
    UniformMatrix4x3fv,
    UniformMatrix2x4fv,
    UniformMatrix3x4fv,
    UniformMatrix4fv,
}

export function setUniform(gl: WebGL2RenderingContext, location: WebGLUniformLocation, type: UniformTypes, data: number[])
{
    if (type === UniformTypes.Uniform1ui)
        return gl.uniform1ui(location, ...(data as [ number ]));
    if (type === UniformTypes.Uniform2ui)
        return gl.uniform2ui(location, ...(data as [ number, number ]));
    if (type === UniformTypes.Uniform3ui)
        return gl.uniform3ui(location, ...(data as [ number, number, number ]));
    if (type === UniformTypes.Uniform4ui)
        return gl.uniform4ui(location, ...(data as [ number, number, number, number ]));

    if (type === UniformTypes.Uniform1fv)
        return gl.uniform1fv(location, data);
    if (type === UniformTypes.Uniform2fv)
        return gl.uniform2fv(location, data);
    if (type === UniformTypes.Uniform3fv)
        return gl.uniform3fv(location, data);
    if (type === UniformTypes.Uniform4fv)
        return gl.uniform4fv(location, data);
    if (type === UniformTypes.Uniform1iv)
        return gl.uniform1iv(location, data);
    if (type === UniformTypes.Uniform2iv)
        return gl.uniform2iv(location, data);
    if (type === UniformTypes.Uniform3iv)
        return gl.uniform3iv(location, data);
    if (type === UniformTypes.Uniform4iv)
        return gl.uniform4iv(location, data);
    if (type === UniformTypes.Uniform1uiv)
        return gl.uniform1uiv(location, data);
    if (type === UniformTypes.Uniform2uiv)
        return gl.uniform2uiv(location, data);
    if (type === UniformTypes.Uniform3uiv)
        return gl.uniform3uiv(location, data);
    if (type === UniformTypes.Uniform4uiv)
        return gl.uniform4uiv(location, data);

    if (type === UniformTypes.UniformMatrix2fv)
        return gl.uniformMatrix2fv(location, false, data);
    if (type === UniformTypes.UniformMatrix3x2fv)
        return gl.uniformMatrix3x2fv(location, false, data);
    if (type === UniformTypes.UniformMatrix4x2fv)
        return gl.uniformMatrix4x2fv(location, false, data);
    if (type === UniformTypes.UniformMatrix2x3fv)
        return gl.uniformMatrix2x3fv(location, false, data);
    if (type === UniformTypes.UniformMatrix3fv)
        return gl.uniformMatrix3fv(location, false, data);
    if (type === UniformTypes.UniformMatrix4x3fv)
        return gl.uniformMatrix4x3fv(location, false, data);
    if (type === UniformTypes.UniformMatrix2x4fv)
        return gl.uniformMatrix2x4fv(location, false, data);
    if (type === UniformTypes.UniformMatrix3x4fv)
        return gl.uniformMatrix3x4fv(location, false, data);
    if (type === UniformTypes.UniformMatrix4fv)
        return gl.uniformMatrix4fv(location, false, data);
}