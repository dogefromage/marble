import { DataTypes, GeometryZ, ObjMap, OutputRowT } from "../../types";
import _ from 'lodash';
import { generateEdgeSymbol } from "../sceneProgram/programSymbols";

export interface GeometryEdge
{
    fromNodeIndex: number;
    fromRowIndex: number;
    toNodeIndex: number;
    toRowIndex: number;
    dataType: DataTypes;
    symbol: string;
    key: string;
}

export type NestedMap<T> = ObjMap<ObjMap<T>>;

export type ForwardAdjacencyList = NestedMap<GeometryEdge[]>;
export type BackwardAdjacencyList = NestedMap<GeometryEdge>;

function customizer(objValue: any, srcValue: any)
{
    if (_.isArray(objValue))
    {
        return objValue.concat(srcValue);
    }
}

function locationHash(node: string, row: string)
{
    return [ node, row ].join('-');
}

export function generateAdjacencyLists(g: GeometryZ)
{
    const N = g.nodes.length;

    // const forwards: GeometryEdge[][][] = [];
    // const backwards: GeometryEdge[][] = [];

    const forwardsAdjList: ForwardAdjacencyList = {};
    const backwardsAdjList: BackwardAdjacencyList = {};

    const outputIndicesMap = new Map<string, { nodeIndex: number, rowIndex: number }>();
    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++)
    {
        const node = g.nodes[ nodeIndex ];
        for (let rowIndex = 0; rowIndex < node.rows.length; rowIndex++)
        {
            const row = node.rows[ rowIndex ];
            const key = locationHash(node.id, row.id);
            outputIndicesMap.set(key, { nodeIndex, rowIndex });
        }
    }

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++)
    {
        const node = g.nodes[ nodeIndex ];
        for (let rowIndex = 0; rowIndex < node.rows.length; rowIndex++)
        {
            const row = node.rows[ rowIndex ];
            if (row.connectedOutput)
            {
                const outputKey = locationHash(row.connectedOutput.nodeId, row.connectedOutput.rowId);
                const outputIndices = outputIndicesMap.get(outputKey);
                if (!outputIndices) continue;

                const dataType = (row as OutputRowT).dataType || DataTypes.Unknown;
                const symbol = generateEdgeSymbol(outputIndices.nodeIndex, outputIndices.rowIndex);
                const key = [ 'edge-key', outputIndices.nodeIndex, outputIndices.rowIndex, nodeIndex, rowIndex ].join('-');

                const edge: GeometryEdge =
                {
                    fromNodeIndex: outputIndices.nodeIndex,
                    fromRowIndex: outputIndices.rowIndex,
                    toNodeIndex: nodeIndex,
                    toRowIndex: rowIndex,
                    dataType,
                    symbol,
                    key, 
                };

                const forwardAddition = { 
                    [outputIndices.nodeIndex]: {
                        [outputIndices.rowIndex]: [ edge ],
                    }
                };
                _.mergeWith(forwardsAdjList, forwardAddition, customizer);

                const backwardAddition = { 
                    [nodeIndex]: {
                        [rowIndex]: edge,
                    }
                };
                _.mergeWith(backwardsAdjList, backwardAddition, customizer);
            }
        }
    }

    return {
        forwardsAdjList,
        backwardsAdjList,
    }
}