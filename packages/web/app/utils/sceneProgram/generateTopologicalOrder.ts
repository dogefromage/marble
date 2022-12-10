import { GeometryAdjacencyList } from "../../types";
import { generateEdges } from "./generateEdges";

function topSortDfs(adjList: GeometryAdjacencyList, order: number[], visited: Set<number>, at: number)
{
    if (visited.has(at)) return;

    visited.add(at);

    for (const edge of generateEdges(adjList[at]))
    {
        topSortDfs(adjList, order, visited, edge.toIndices[0]);
    }

    order.unshift(at);
}

export function generateTopologicalOrder(adjList: GeometryAdjacencyList, outputIndex: number)
{
    const order: number[] = [];
    const visited = new Set<number>();

    order.push(outputIndex);
    visited.add(outputIndex);

    for (const at in adjList)
    {
        topSortDfs(adjList, order, visited, parseInt(at));
    }

    return order;
}