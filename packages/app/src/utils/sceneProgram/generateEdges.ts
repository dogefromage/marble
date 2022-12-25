import { GeometryAdjacencyList } from "../../types";

export function *generateEdges(adjListNode: GeometryAdjacencyList[number])
{
    for (const rowIndex in adjListNode)
    {
        for (const edge of adjListNode[rowIndex])
        {
            if (edge)
            {
                yield edge
            }
        }
    }
}