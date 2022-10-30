
export enum GeometriesCompilationErrorTypes
{
    OutputMissing = 'output-missing',
    HasCycle = 'has-cycle',
    SnippetMissing = 'snippet-missing',
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