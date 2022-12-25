import _ from 'lodash';
import { GeometryFromIndices, GeometryAdjacencyList, GeometryEdge, GeometryNodeRowOrder, GeometryS, GeometryTemplateMap, GeometryJointLocation, OutputRowT, GeometryToIndices, GeometryConnectedRows, GeometryIncomingElementTypes, GeometryArgumentConsumer } from "../../types";
import { assertRowTHas } from "./assertions";
import { rowLocationHash } from "./locationHashes";

function customizer(objValue: any, srcValue: any)
{
    if (_.isArray(objValue))
    {
        return objValue.concat(srcValue);
    }
}

export function generateAdjacencyLists(
    geometry: GeometryS, 
    rowOrders: GeometryNodeRowOrder, 
    templateMap: GeometryTemplateMap
) {
    const N = geometry.nodes.length;

    const forwardEdges: GeometryAdjacencyList = {};
    const backwardEdges: GeometryAdjacencyList = {};

    const outputIndicesMap = new Map<string, { nodeIndex: number, rowIndex: number }>();
    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++)
    {
        const node = geometry.nodes[ nodeIndex ];
        const rowOrder = rowOrders.get(node.id)!;
        
        for (let rowIndex = 0; rowIndex < rowOrder.length; rowIndex++)
        {
            const key = rowLocationHash({
                nodeId: node.id,
                rowId: rowOrder[rowIndex],
            });
            outputIndicesMap.set(key, { nodeIndex, rowIndex });
        }
    }

    const argumentConsumers: GeometryArgumentConsumer[] = [];
    const strayConnectedJoints: GeometryJointLocation[] = [];

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++)
    {
        const node = geometry.nodes[ nodeIndex ];
        const template = templateMap.get(node.id)!;
        const rowOrder = rowOrders.get(node.id)!;

        for (let rowIndex = 0; rowIndex < rowOrder.length; rowIndex++)
        {
            const rowId = rowOrder[rowIndex];
            const row = node.rows[rowId];

            for (let subIndex = 0; subIndex < row.incomingElements.length; subIndex++)
            {
                const toIndices: GeometryToIndices = [ nodeIndex, rowIndex, subIndex ];
                
                const incoming = row.incomingElements[subIndex];
                if (incoming.type === GeometryIncomingElementTypes.Argument) {
                    argumentConsumers.push({
                        id: `arg:${toIndices.join('.')}`,
                        indices: toIndices,
                        argument: incoming.argument,
                    });
                    continue;
                }

                const output = incoming.location;

                const fromRowKey = rowLocationHash(output);
                const fromRowCoordinates = outputIndicesMap.get(fromRowKey);

                const jointLocation = {
                    nodeId: node.id,
                    rowId,
                    subIndex,
                };
                
                if (!fromRowCoordinates)
                {
                    strayConnectedJoints.push(jointLocation);
                    continue;
                }

                // get dataType
                const templateRow = template.rows[rowIndex];
                if (!assertRowTHas<OutputRowT>(templateRow, 'dataType')) 
                    throw new Error(`Property missing 'dataType'`);
                const { dataType } = templateRow;

                const fromIndices: GeometryFromIndices = [ fromRowCoordinates.nodeIndex, fromRowCoordinates.rowIndex ];

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
                    dataType,
                };

                const forwardAddition = { 
                    [fromRowCoordinates.nodeIndex]: {
                        [fromRowCoordinates.rowIndex]: [ edge ],
                    }
                };
                _.mergeWith(forwardEdges, forwardAddition, customizer);

                const backwardAddition = { 
                    [nodeIndex]: {
                        [rowIndex]: {
                            [subIndex]: edge,
                        }
                    }
                };
                _.mergeWith(backwardEdges, backwardAddition, customizer);
            }
        }
    }

    return {
        forwardEdges,
        backwardEdges,
        strayConnectedJoints,
        argumentConsumers,
    }
}