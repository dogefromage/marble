
export enum GeometriesCompilationErrorTypes
{
    OutputMissing = 'output-missing',
    HasCycle = 'has-cycle',
    IncludeMissing = 'include-missing',
    InvalidGraph = 'invalid-graph',
}

export class GeometriesCompilationError extends Error
{
    constructor(
        public type: GeometriesCompilationErrorTypes
    )
    {
        super(`Error "${type}" at compiling geometry`);
    }
}