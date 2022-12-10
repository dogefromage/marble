import { GNodeS } from "./GNode";

export interface GeometryS
{
    id: string;
    name: string;
    nodes: Array<GNodeS>;
    outputId: string | null;
    compilationValidity: number;
    rowStateValidity: number;
    nextIdIndex: number;
}

// export type GeometryZ = Override<GeometryS, 'nodes', Array<GNodeZ>>;