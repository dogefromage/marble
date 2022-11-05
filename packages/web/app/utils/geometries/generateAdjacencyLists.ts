import _ from 'lodash';
import { DataTypes, GeometryZ, JointLocation, ObjMap, OutputRowT } from "../../types";
import { assertRowHas } from "./assertions";
import { rowLocationHash } from "./locationHashes";

type FromIndices = [ number, number ];
type ToIndices = [ number, number, number ];

export interface GeometryEdge
{
    id: string;
    fromIndices: FromIndices;
    toIndices: ToIndices;
    dataType: DataTypes;
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

    const strayConnectedJoints: JointLocation[] = [];

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

                if (!fromRowCoordinates)
                {
                    strayConnectedJoints.push({
                        nodeId: node.id,
                        rowId: row.id,
                        subIndex,
                    });
                    continue;
                }

                if (!assertRowHas<OutputRowT>(row, 'dataType')) 
                    throw new Error(`Property missing 'dataType'`);

                const toIndices: ToIndices = [ nodeIndex, rowIndex, subIndex ];
                const fromIndices: FromIndices = [ fromRowCoordinates.nodeIndex, fromRowCoordinates.rowIndex ];

                const edgeId = [ 
                    'edge', 
                    ...fromIndices,
                    ...toIndices,
                ].join('-');
    
                const edge: GeometryEdge =
                {
                    id: edgeId,
                    fromIndices,
                    toIndices,
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
        strayConnectedJoints,
    }
}