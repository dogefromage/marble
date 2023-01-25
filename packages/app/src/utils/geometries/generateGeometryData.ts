import _ from "lodash";
import { GeometryAdjacencyList, GeometryConnectionData, GeometryEdge, GeometryFromIndices, GeometryIncomingElementTypes, GeometryJointLocation, GeometryS, GeometryToIndices, GNodeData, GNodeT, GNodeTemplateTypes, InputOnlyRowT, NullArr, ObjMap, ObjMapUndef } from "../../types";
import { generateNodeRowHeights } from "./geometryUtils";

function customizer(objValue: any, srcValue: any) {
    if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
    }
}

function outputKey(nodeId: string, rowId: string) {
    return `${nodeId}_${rowId}`;
}

function genAdjList(
    geometry: GeometryS,
    nodeTemplates: NullArr<GNodeT>,
) {
    const N = geometry.nodes.length;

    const forwardEdges: GeometryAdjacencyList = {};
    const backwardEdges: GeometryAdjacencyList = {};

    type RowCoordinates = { nodeIndex: number, rowIndex: number };
    const outputIndicesMap = new Map<string, RowCoordinates>();
    // if a template is missing, we add it to this set for making sure to ignore it later
    const noUptodateTemplate = new Set<string>();

    const rowConnectedJoints: NullArr<GNodeData[ 'rowConnections' ]> =
        new Array(N).fill(null);

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++) {
        const node = geometry.nodes[ nodeIndex ];
        const template = nodeTemplates[ nodeIndex ];
        if (template) {
            // initialize connection count
            const nodesConnections: ObjMap<number> = {};
            rowConnectedJoints[ nodeIndex ] = nodesConnections;
            for (let rowIndex = 0; rowIndex < template.rows.length; rowIndex++) {
                const rowId = template.rows[ rowIndex ].id;
                outputIndicesMap.set(outputKey(node.id, rowId), { nodeIndex, rowIndex });
                nodesConnections[ rowId ] = 0;
            }
        } else {
            noUptodateTemplate.add(node.id);
        }
    }

    const strayJoints: GeometryJointLocation[] = [];

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++) {
        const node = geometry.nodes[ nodeIndex ];
        const template = nodeTemplates[ nodeIndex ];
        if (!template) continue;

        for (let rowIndex = 0; rowIndex < template.rows.length; rowIndex++) {
            const templateRow = template.rows[ rowIndex ] as InputOnlyRowT;
            const rowId = templateRow.id;
            const row = node.rows[ rowId ];
            if (!row) continue; // unconnected

            for (let subIndex = 0; subIndex < row.incomingElements.length; subIndex++) {
                const incoming = row.incomingElements[ subIndex ];
                if (incoming.type === GeometryIncomingElementTypes.Argument) {
                    // is not a connection
                    continue;
                }

                const outputLocation = incoming.location;
                if (noUptodateTemplate.has(outputLocation.nodeId)) {
                    /**
                     * this output node can be ignored, since we do not know if the edge is still connected.
                    */
                    continue;
                }

                const key = outputKey(outputLocation.nodeId, outputLocation.rowId);
                const fromRowCoordinates = outputIndicesMap.get(key);
                if (!fromRowCoordinates) {
                    /**
                     * We know that this node had a up to date 
                     * template but the specified row doesn't exist.
                     */
                    strayJoints.push({
                        nodeId: node.id,
                        rowId,
                        subIndex,
                    });
                    continue;
                }

                /**
                 * This edge can be added from here on:
                 */
                const toIndices: GeometryToIndices = [ nodeIndex, rowIndex, subIndex ];
                const fromIndices: GeometryFromIndices = [ fromRowCoordinates.nodeIndex, fromRowCoordinates.rowIndex ];

                // increment num connections for both nodes
                rowConnectedJoints[ nodeIndex ]![ templateRow.id! ] += 1;
                rowConnectedJoints[ fromRowCoordinates.nodeIndex ]![ outputLocation.rowId ] += 1;

                const edge: GeometryEdge = {
                    id: [ 'edge', ...fromIndices, ...toIndices ].join('-'),
                    fromIndices, toIndices,
                    dataType: templateRow.dataType,
                };

                // add edge into adj.
                const forwardAddition = {
                    [ fromIndices[ 0 ] ]: { [ fromIndices[ 1 ] ]: [ edge ] }
                };
                const backwardAddition = {
                    [ toIndices[ 0 ] ]: { [ toIndices[ 1 ] ]: { [ toIndices[ 2 ] ]: edge } }
                };
                _.mergeWith(forwardEdges, forwardAddition, customizer);
                _.mergeWith(backwardEdges, backwardAddition, customizer);
            }
        }
    }

    return {
        forwardEdges,
        backwardEdges,
        strayJoints,
        rowConnectedJoints,
    }
}

export default function generateGeometryData(geometry: GeometryS, templates: ObjMapUndef<GNodeT>, hash: number) {
    const N = geometry.nodes.length;
    const nodeTemplates: NullArr<GNodeT> = new Array(N).fill(null);
    const expiredNodeStates: GeometryConnectionData[ 'expiredProps' ][ 'expiredNodeStates' ] = [];

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++) {
        const node = geometry.nodes[ nodeIndex ];
        const template = templates[ node.templateId ];
        if (!template) continue; // data stays null

        if (node.templateData == null || node.templateData.version < template.version) {
            expiredNodeStates.push({
                nodeIndex, template,
            });
        }
        nodeTemplates[ nodeIndex ] = template;
    };

    const {
        forwardEdges,
        backwardEdges,
        strayJoints,
        rowConnectedJoints,
    } = genAdjList(geometry, nodeTemplates);

    const nodeDatas: NullArr<GNodeData> = new Array(N).fill(null);
    const dependencies = new Set<string>();

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++) {
        const node = geometry.nodes[ nodeIndex ];

        const template = nodeTemplates[ nodeIndex ];
        if (!template) {
            // default is null
            continue;
        }
        if (template.type === GNodeTemplateTypes.Composite) {
            dependencies.add(template.id);
        }

        const rowConnections = rowConnectedJoints[ nodeIndex ]!;
        const rowHeights = generateNodeRowHeights(node, template, rowConnections);

        const nodeData: GNodeData = {
            template,
            rowHeights,
            rowConnections,
        };
        nodeDatas[ nodeIndex ] = nodeData;
    }

    const expirationNeedsUpdate =
        strayJoints.length + expiredNodeStates.length > 0;

    const connectionData: GeometryConnectionData = {
        geometryId: geometry.id,
        geometryVersion: geometry.version,
        hash,
        nodeDatas,
        forwardEdges,
        backwardEdges,
        expiredProps: {
            needsUpdate: expirationNeedsUpdate,
            strayJoints,
            expiredNodeStates,
        },
        dependencies: Array.from(dependencies),
    }

    return connectionData;
}
