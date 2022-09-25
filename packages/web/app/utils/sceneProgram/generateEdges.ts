import { GeometryEdge } from "../geometries/generateAdjacencyLists";


export function *generateEdges(adjListNode: GeometryEdge[][])
{
    if (adjListNode)
    {
        for (const row of adjListNode)
        {
            if (row)
            {
                for (const edge of row)
                {
                    if (edge)
                    {
                        yield edge
                    }
                }
            }
        }
    }
}