import { GeometryAdjacencyList } from "../../types";

export default function(n: number, geometryAdjacencyList: GeometryAdjacencyList) {   
    const adj = new Array(n).fill(0).map(_ => new Array<number>());
    for (const nodeEdges of Object.values(geometryAdjacencyList)) {
        for (const rowEdges of Object.values(nodeEdges)) {
            for (const edge of rowEdges) {
                adj[edge.fromIndices[0]].push(edge.toIndices[0]);
            }
        }
    }
    return adj;
}