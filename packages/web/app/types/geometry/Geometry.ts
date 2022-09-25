import { Override } from "../utils";
import { GNodeS, GNodeZ } from "./GNode";

export interface GeometryS
{
    id: string;
    name: string;
    nodes: Array<GNodeS>;
    outputId: string | null;
    validity: number;
    nextIdIndex: number;
}

export type GeometryZ = Override<GeometryS, 'nodes', Array<GNodeZ>>;
