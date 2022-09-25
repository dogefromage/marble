import { ForwardAdjacencyList, GeometryEdge } from "../geometries/generateAdjacencyLists";
import { generateEdges } from "./generateEdges";

function topSortDfs(adjList: ForwardAdjacencyList, order: number[], visited: Set<number>, at: number)
{
    if (visited.has(at)) return;

    visited.add(at);

    for (const edge of generateEdges(adjList[at]))
    {
        topSortDfs(adjList, order, visited, edge.toNodeIndex);
    }

    order.unshift(at);
}

export function generateTopologicalOrder(adjList: ForwardAdjacencyList)
{
    const order: number[] = [];
    const visited = new Set<number>();

    for (const at in adjList)
    {
        topSortDfs(adjList, order, visited, parseInt(at));
    }

    return order;
}