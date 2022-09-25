import { DataTypes, GeometryZ, OutputRowT } from "../../types";

export interface GeometryEdge
{
    fromNodeIndex: number;
    fromRowIndex: number;
    toNodeIndex: number;
    toRowIndex: number;
    dataType: DataTypes;
    key: string;
}

function getA<T>(array: Array<Array<T>>, index: number): Array<T>
{
    if (array[index] == null)
        array[index] = [];

    return array[index];
}

export function generateAdjacencyLists(g: GeometryZ)
{
    const N = g.nodes.length;

    // const forwards: GeometryEdge[][][] = new Array(N).fill(null);
    // const backwards: GeometryEdge[][] = new Array(N).fill(null);

    const forwards: GeometryEdge[][][] = [];
    const backwards: GeometryEdge[][] = [];

    const outputIndicesMap = new Map<string, { nodeIndex: number , rowIndex: number }>();
    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++)
    {
        const node = g.nodes[nodeIndex];
        for (let rowIndex = 0; rowIndex < node.rows.length; rowIndex++)
        {
            const row = node.rows[rowIndex];
            const key = node.id + '.' + row.id;
            outputIndicesMap.set(key, { nodeIndex, rowIndex });
        }
    }

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++)
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

                // forwards[outputIndices.nodeIndex][outputIndices.rowIndex].push(edge);
                // backwards[nodeIndex][rowIndex] = edge;

                getA(getA(forwards, outputIndices.nodeIndex), outputIndices.rowIndex).push(edge);
                getA(backwards, nodeIndex)[rowIndex] = edge;
            }
        }
    }

    return {
        forwards,
        backwards,
    }
}