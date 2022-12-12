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
    selectedNodes: string[];
    // activeNode: string | null;
}