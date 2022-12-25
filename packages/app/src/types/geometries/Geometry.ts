import { GNodeS } from "./GNode";

export interface GeometryS
{
    id: string;
    name: string;
    nodes: Array<GNodeS>;
    compilationValidity: number;
    rowStateValidity: number;
    nextIdIndex: number;
    selectedNodes: string[];
}