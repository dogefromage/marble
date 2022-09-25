import { GeometryEdge } from "../geometries/generateAdjacencyLists";
import { generateEdges } from "./generateEdges";

function findUsedDFS(adjList: GeometryEdge[][][], used: boolean[], at: number)
{
    if (used[at]) return true;

    for (const edge of generateEdges(adjList[at]))
    {
        const nextUsed = findUsedDFS(adjList, used, edge.toNodeIndex);

        if (nextUsed)
        {
            used[at] = true;
            return true;
        }
    }
    
    // for (const row of adjList[at])
    // {
    //     for (const edge of row)
    //     {
    //         const nextUsed = findUsedDFS(adjList, used, edge.toNodeIndex);

    //         if (nextUsed)
    //         {
    //             used[at] = true;
    //             return true;
    //         }
    //     }
    // }

    return false;
}

export default function findUsedNodes(adjList: GeometryEdge[][][], outputIndex: number)
{
    const used = new Array<boolean>(adjList.length).fill(true);
    used[outputIndex] = true;

    for (let i = 0; i < adjList.length; i++)
    {
        findUsedDFS(adjList, used, i);
    }

    return used;
}