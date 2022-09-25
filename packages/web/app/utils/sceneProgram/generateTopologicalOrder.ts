import { GeometryEdge } from "../geometries/generateAdjacencyLists";

function topSortDfs(adjList: GeometryEdge[][][], order: number[], at: number, i: number)
{


    for (const row of adjList[at])
    {
        for (const edge of row)
        {
            topSortDfs(adjList, order, edge.toNodeIndex, i);
        }
    }

    order[i] = at;

    return i - 1;
}

export function generateTopologicalOrder(adjList: GeometryEdge[][][])
{
    const order = new Array<number>(adjList.length).fill(-1);

    let i = adjList.length - 1;

    for (let at = 0; at < adjList.length; at++)
    {
        i = topSortDfs(adjList, order, at, i);
    }
}