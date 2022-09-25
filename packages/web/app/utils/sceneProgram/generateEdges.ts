import { ForwardAdjacencyList } from "../geometries/generateAdjacencyLists";

export function *generateEdges(adjListNode: ForwardAdjacencyList[number])
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