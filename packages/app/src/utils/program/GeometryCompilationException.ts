
export class GeometryCompilationException extends Error
{
    constructor(msg: string)
    {
        super(`Error compiling program: ${msg}`);
    }
}
