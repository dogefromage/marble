import { GeometryAdjacencyList, ObjMap } from "../../types";
import { generateEdges } from "./generateEdges";

enum NodeStatus
{
    None,
    Visited,
    AcyclicDownwards,
}

function acylicDFS(adjList: GeometryAdjacencyList, at: number, status: ObjMap<NodeStatus>, cycles: number[]): number | undefined
{
    if (status[at] === NodeStatus.AcyclicDownwards) 
        return;

    if (status[at] === NodeStatus.Visited)
    {
        cycles.push(at);
        return;
    }

    status[at] = NodeStatus.Visited;

    for (const edge of generateEdges(adjList[at]))
    {
        acylicDFS(adjList, edge.toIndices[0], status, cycles);
    }

    status[at] = NodeStatus.AcyclicDownwards;
}

export function checkGeometryAcyclic(adjList: GeometryAdjacencyList)
{
    const N = Object.keys(adjList).length;
    const status: ObjMap<NodeStatus> = {};
    const cycles: number[] = [];

    for (const at in adjList)
    {
        acylicDFS(adjList, parseInt(at), status, cycles);
    }

    return cycles;
}