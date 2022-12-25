import { GeometryAdjacencyList, GeometryConnectedRows, GeometryNodeRowOrder, GeometryS } from "../../types";


export default function findConnectedRows(geometry: GeometryS, rowOrders: GeometryNodeRowOrder, forwardEdges: GeometryAdjacencyList)
{
    const N = geometry.nodes.length;
    const connectedRows: GeometryConnectedRows = new Map<string, Set<string>>();

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++)
    {
        const node = geometry.nodes[ nodeIndex ];
        connectedRows.set(node.id, new Set());
    }

    for (const rowEdges of Object.values(forwardEdges))
    {
        for (const subEdges of Object.values(rowEdges))
        {
            for (let i = 0; i < subEdges.length; i++)
            {
                const edge = subEdges[i];

                const fromNodeId = geometry.nodes[edge.fromIndices[0]].id;
                const fromRowOrder = rowOrders.get(fromNodeId)!;
                const fromRowId = fromRowOrder[edge.fromIndices[1]];
                connectedRows.get(fromNodeId)!.add(fromRowId);
                
                const toNodeId = geometry.nodes[edge.toIndices[0]].id;
                const toRowOrder = rowOrders.get(toNodeId)!;
                const toRowId = toRowOrder[edge.toIndices[1]];
                connectedRows.get(toNodeId)!.add(toRowId);
            }
        }
    }

    return connectedRows;
}