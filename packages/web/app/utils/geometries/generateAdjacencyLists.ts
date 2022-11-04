import _ from 'lodash';
import { DataTypes, GeometryZ, ObjMap, OutputRowT } from "../../types";
import { assertRowHas } from "./assertions";
import { rowLocationHash } from "./locationHashes";

export interface GeometryEdge
{
    id: string;
    fromIndices: [ number, number ];
    toIndices: [ number, number, number ];
    dataType: DataTypes;
    // outputHash: string;
}

export type NestedMap<T> = ObjMap<ObjMap<T>>;

export type ForwardAdjacencyList = NestedMap<GeometryEdge[]>;
export type BackwardAdjacencyList = NestedMap<GeometryEdge[]>;

function customizer(objValue: any, srcValue: any)
{
    if (_.isArray(objValue))
    {
        return objValue.concat(srcValue);
    }
}

export function generateAdjacencyLists(g: GeometryZ)
{
    const N = g.nodes.length;

    const forwardsAdjList: ForwardAdjacencyList = {};
    const backwardsAdjList: BackwardAdjacencyList = {};

    const outputIndicesMap = new Map<string, { nodeIndex: number, rowIndex: number }>();
    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++)
    {
        const node = g.nodes[ nodeIndex ];
        for (let rowIndex = 0; rowIndex < node.rows.length; rowIndex++)
        {
            const row = node.rows[ rowIndex ];

            const key = rowLocationHash({
                nodeId: node.id,
                rowId: row.id,
            });
            outputIndicesMap.set(key, { nodeIndex, rowIndex });
        }
    }

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++)
    {
        const node = g.nodes[ nodeIndex ];
        for (let rowIndex = 0; rowIndex < node.rows.length; rowIndex++)
        {
            const row = node.rows[ rowIndex ];

            for (let subIndex = 0; subIndex < row.connectedOutputs.length; subIndex++)
            {
                const output = row.connectedOutputs[subIndex];

                const fromRowKey = rowLocationHash(output);
                const fromRowCoordinates = outputIndicesMap.get(fromRowKey);
                if (!fromRowCoordinates) continue;

                if (!assertRowHas<OutputRowT>(row, 'dataType')) 
                    throw new Error(`Property missing 'dataType'`);

                const fromIndices = [ fromRowCoordinates.nodeIndex, fromRowCoordinates.rowIndex ];
                const toIndices = [ nodeIndex, rowIndex, subIndex ];

                const edgeId = [ 
                    'edge', 
                    ...fromIndices,
                    ...toIndices,
                ].join('-');
    
                const edge: GeometryEdge =
                {
                    id: edgeId,
                    fromIndices: fromIndices as [ number, number ],
                    toIndices: toIndices as [ number, number, number ],
                    dataType: row.dataType,
                };

                const forwardAddition = { 
                    [fromRowCoordinates.nodeIndex]: {
                        [fromRowCoordinates.rowIndex]: [ edge ],
                    }
                };
                _.mergeWith(forwardsAdjList, forwardAddition, customizer);

                const backwardAddition = { 
                    [nodeIndex]: {
                        [rowIndex]: {
                            [subIndex]: edge,
                        }
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