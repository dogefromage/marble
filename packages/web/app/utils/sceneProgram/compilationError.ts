
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
        public message: GeometriesCompilationErrorTypes | string
    )
    {
        super();

        if (message in GeometriesCompilationErrorTypes)
            this.message = `Error "${message}" at compiling geometry`;
        else 
            this.message = "CompilationError: " + message;
    }
}