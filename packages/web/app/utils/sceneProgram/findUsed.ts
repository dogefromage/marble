import { GeometryAdjacencyList } from "../../types";
import { generateEdges } from "./generateEdges";

function findUsedDFS(adjList: GeometryAdjacencyList, used: Set<number>, at: number)
{
    if (used.has(at)) return true;

    for (const edge of generateEdges(adjList[at]))
    {
        const nextUsed = findUsedDFS(adjList, used, edge.toIndices[0]);

        if (nextUsed)
        {
            used.add(at);
            return true;
        }
    }

    return false;
}

export default function findUsedNodes(adjList: GeometryAdjacencyList, outputIndex: number)
{
    const used = new Set<number>();
    used.add(outputIndex);

    for (const at in adjList)
    {
        findUsedDFS(adjList, used, parseInt(at));
    }

    return used;
}