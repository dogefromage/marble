import { GeometryEdge } from "../geometries/generateAdjacencyLists";
import { generateEdges } from "./generateEdges";

function topSortDfs(adjList: GeometryEdge[][][], order: number[], visited: boolean[], at: number, i: number)
{
    if (visited[at]) return i;

    visited[at] = true;

    for (const edge of generateEdges(adjList[at]))
    {
        topSortDfs(adjList, order, visited, edge.toNodeIndex, i);
    }

    // if (adjList[at])
    // {
    //     for (const row of adjList[at])
    //     {
    //         if (row)
    //         {
    //             for (const edge of row)
    //             {
    //                 topSortDfs(adjList, order, visited, edge.toNodeIndex, i);
    //             }
    //         }
    //     }
    // }

    order[i] = at;

    return i - 1;
}

export function generateTopologicalOrder(adjList: GeometryEdge[][][])
{
    const order = new Array<number>(adjList.length).fill(0);
    const visited = new Array<boolean>(adjList.length).fill(false);

    let i = adjList.length - 1;

    for (let at = 0; at < adjList.length; at++)
    {
        i = topSortDfs(adjList, order, visited, at, i);
    }

    return order;
}