import { GeometryZ, KeyValueMap, SceneProgramNode } from "../../types";

export enum GeometriesCompilationErrorTypes
{
    OutputMissing = 'output-missing'
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

export function compileGeometries(
    geometry: GeometryZ,
)
{
    const outputNode = geometry.nodes.find(n => n.id === geometry.outputId);
    if (!outputNode) 
        throw new GeometriesCompilationError(
            GeometriesCompilationErrorTypes.OutputMissing,
        );
    
    // return list of used operations in right order
}