import { DataTypes, GeometryZ, OutputRowT } from "../../slices/GeometriesSlice/types/Geometry";
import { arraySetNested } from "../array";

export interface GeometryEdge
{
    fromNodeIndex: number;
    fromRowIndex: number;
    toNodeIndex: number;
    toRowIndex: number;
    dataType: DataTypes;
    key: string;
}

export function generateAdjacencyLists(g: GeometryZ)
{
    const forwards: GeometryEdge[][] = [];
    const backwards: GeometryEdge[][] = [];

    const outputIndicesMap = new Map<string, { nodeIndex: number , rowIndex: number }>();
    for (let nodeIndex = 0; nodeIndex < g.nodes.length; nodeIndex++)
    {
        const node = g.nodes[nodeIndex];
        for (let rowIndex = 0; rowIndex < node.rows.length; rowIndex++)
        {
            const row = node.rows[rowIndex];
            const key = node.id + '.' + row.id;
            outputIndicesMap.set(key, { nodeIndex, rowIndex });
        }
    }


    for (let nodeIndex = 0; nodeIndex < g.nodes.length; nodeIndex++)
    {
        const node = g.nodes[nodeIndex];
        for (let rowIndex = 0; rowIndex < node.rows.length; rowIndex++)
        {
            const row = node.rows[rowIndex];
            if (row.connectedOutput)
            {
                const outputKey = row.connectedOutput.nodeId + '.' + row.connectedOutput.rowId;
                const outputIndices = outputIndicesMap.get(outputKey);
                if (!outputIndices) continue;

                const dataType = (row as OutputRowT).dataType || DataTypes.Unknown;
                const inputKey = nodeIndex + '.' + rowIndex;

                const edge: GeometryEdge =
                {
                    fromNodeIndex: outputIndices.nodeIndex,
                    fromRowIndex: outputIndices.rowIndex,
                    toNodeIndex: nodeIndex,
                    toRowIndex: rowIndex,
                    dataType,
                    key: outputKey + ':' +inputKey,
                }

                arraySetNested(forwards, edge, outputIndices.nodeIndex, outputIndices.rowIndex);
                arraySetNested(backwards, edge, nodeIndex, rowIndex);
            }
        }
    }

    return {
        forwards,
        backwards,
    }
}