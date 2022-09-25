import { GeometryEdge } from "../geometries/generateAdjacencyLists";
import { generateEdges } from "./generateEdges";

class CycleFoundError extends Error
{
    constructor(
        public cycleNodeIndex: number
    )
    {
        super();
    }
}

enum NodeStatus
{
    None,
    Visited,
    AcyclicDownwards,
}

function acylicDFS(adjList: GeometryEdge[][][], at: number, status: NodeStatus[])
{
    if (status[at] === NodeStatus.AcyclicDownwards) 
        return;

    if (status[at] === NodeStatus.Visited)
        throw new CycleFoundError(at);

    status[at] = NodeStatus.Visited;

    for (const edge of generateEdges(adjList[at]))
    {
        acylicDFS(adjList, edge.toNodeIndex, status);
    }

    // for (const row of adjList[at])
    // {
    //     for (const edge of row)
    //     {
    //         acylicDFS(adjList, edge.toNodeIndex, status);
    //     }
    // }

    status[at] = NodeStatus.AcyclicDownwards;
}

export function checkGeometryAcyclic(adjList: GeometryEdge[][][])
{
    const status = new Array<NodeStatus>(adjList.length)
        .fill(NodeStatus.None);

    try
    {
        for (let i = 0; i < adjList.length; i++)
        {
            acylicDFS(adjList, i, status);
        }
    }
    catch (e)
    {
        if (e instanceof CycleFoundError)
            return e.cycleNodeIndex;

        throw e;
    }

    return -1;
}