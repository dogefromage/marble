
export enum GeometriesCompilationErrorTypes
{
    OutputMissing = 'output-missing',
    HasCycle = 'has-cycle',
    IncludeMissing = 'include-missing',
    InvalidGraph = 'invalid-graph',
    TemplateMissing = 'template-missing',
}

export class GeometriesCompilationError extends Error
{
    constructor(
        public msg: GeometriesCompilationErrorTypes | string
    )
    {
        super();

        if (msg in GeometriesCompilationErrorTypes)
            this.message = `Error "${msg}" at compiling geometry`;
        else 
            this.message = "CompilationError: " + msg;
    }
}