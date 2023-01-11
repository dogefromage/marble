
export class GeometryCompilationError extends Error
{
    constructor(msg: string)
    {
        super("Scene could not be compiled: " + msg);
    }
}

export class TemplateNotFoundException extends Error
{
    constructor(msg?: string)
    {
        super(msg);
    }
}