import _ from "lodash";
import { BaseInputRowT, DataTypes, decomposeTemplateId, GeometryAdjacencyList, GeometryConnectionData, GeometryEdge, GeometryFromIndices, GeometryJointLocation, GeometryS, GeometryToIndices, GNodeData, GNodeTemplate, GNodeTemplateTypes, InputRowT, NullArr, ObjMap, ObjMapUndef, OutputRowT } from "../../types";
import { calculateNodeSizes as calculateNodeSize } from "./geometryUtils";

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
    nodeTemplates: NullArr<GNodeTemplate>,
) {
    const N = geometry.nodes.length;

    const forwardEdges: GeometryAdjacencyList = {};
    const backwardEdges: GeometryAdjacencyList = {};

    type RowCoordinates = { nodeIndex: number, rowIndex: number, dataType: DataTypes, outputRowIndex: number, };
    const outputIndicesMap = new Map<string, RowCoordinates>();
    // if a template is missing, we add it to this set for making sure to ignore it later
    const noUpToDateTemplate = new Set<string>();

    const rowConnectedJoints: NullArr<GNodeData['rowConnections']> =
        new Array(N).fill(null);

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++) {
        const node = geometry.nodes[nodeIndex];
        const template = nodeTemplates[nodeIndex];
        if (template) {
            // initialize connection count
            const nodesConnections: ObjMap<number> = {};
            rowConnectedJoints[nodeIndex] = nodesConnections;
            let outputCounter = 0;
            for (let rowIndex = 0; rowIndex < template.rows.length; rowIndex++) {
                const row = template.rows[rowIndex] as OutputRowT; // note: not all are outputs, outputs will not be matched
                const key = outputKey(node.id, row.id);
                outputIndicesMap.set(key, {
                    nodeIndex, rowIndex,
                    dataType: row.dataType,
                    outputRowIndex: outputCounter,
                });
                nodesConnections[row.id] = 0;
                if (row.type === 'output') {
                    outputCounter++;
                }
            }
        } else {
            noUpToDateTemplate.add(node.id);
        }
    }

    const strayJoints: GeometryJointLocation[] = [];

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++) {
        const node = geometry.nodes[nodeIndex];
        const template = nodeTemplates[nodeIndex];
        if (!template) continue;

        for (let rowIndex = 0; rowIndex < template.rows.length; rowIndex++) {
            const templateRow = template.rows[rowIndex] as BaseInputRowT;
            const rowId = templateRow.id;
            const row = node.rows[rowId];
            if (!row) continue; // unconnected

            for (let subIndex = 0; subIndex < row.incomingElements.length; subIndex++) {
                const incoming = row.incomingElements[subIndex];
                // DEPRECATED
                // if (incoming.type === 'argument') {
                //     // is not a connection
                //     continue;
                // }

                const outputLocation = incoming.location;
                if (noUpToDateTemplate.has(outputLocation.nodeId)) {
                    /**
                     * this output node can be ignored, since we do not know if the edge is still connected.
                    */
                    continue;
                }

                const key = outputKey(outputLocation.nodeId, outputLocation.rowId);
                const fromRowCoordinates = outputIndicesMap.get(key);
                if (!fromRowCoordinates || fromRowCoordinates.dataType != templateRow.dataType) {
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
                const toIndices: GeometryToIndices = [nodeIndex, rowIndex, subIndex];
                const fromIndices: GeometryFromIndices = [fromRowCoordinates.nodeIndex, fromRowCoordinates.rowIndex];

                // increment num connections for both nodes
                rowConnectedJoints[nodeIndex]![templateRow.id!] += 1;
                rowConnectedJoints[fromRowCoordinates.nodeIndex]![outputLocation.rowId] += 1;

                const edge: GeometryEdge = {
                    id: ['edge', ...fromIndices, ...toIndices].join('-'),
                    fromIndices, toIndices,
                    outputRowIndex: fromRowCoordinates.outputRowIndex,
                    dataType: templateRow.dataType,
                };

                // add edge into adj.
                const forwardAddition = {
                    [fromIndices[0]]: { [fromIndices[1]]: [edge] }
                };
                const backwardAddition = {
                    [toIndices[0]]: { [toIndices[1]]: { [toIndices[2]]: edge } }
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

export default function generateGeometryData(geometry: GeometryS, templates: ObjMapUndef<GNodeTemplate>, hash: number) {
    const N = geometry.nodes.length;
    const nodeTemplates: NullArr<GNodeTemplate> = new Array(N).fill(null);
    const expiredNodeStates: GeometryConnectionData['expiredProps']['expiredNodeStates'] = [];

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++) {
        const node = geometry.nodes[nodeIndex];
        const template = templates[node.templateId];
        if (!template) continue; // data stays null

        const invalidatableTemplateTypes: GNodeTemplateTypes[] = [ 'static', 'composite' ];
        const { type: templateType } = decomposeTemplateId(template.id);
        const isInvalidatable = invalidatableTemplateTypes.includes(templateType);
        if (node.templateVersion < template.version && isInvalidatable) {
            expiredNodeStates.push({
                nodeIndex, template,
            });
        }
        nodeTemplates[nodeIndex] = template;
    };

    const {
        forwardEdges,
        backwardEdges,
        strayJoints,
        rowConnectedJoints,
    } = genAdjList(geometry, nodeTemplates);

    const nodeDatas: NullArr<GNodeData> = new Array(N).fill(null);

    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++) {
        const node = geometry.nodes[nodeIndex];

        const template = nodeTemplates[nodeIndex];
        if (!template) {
            // default is null
            continue;
        }

        const rowConnections = rowConnectedJoints[nodeIndex]!;
        const { widthPixels, rowHeights } = calculateNodeSize(node, template, rowConnections);

        const nodeData: GNodeData = {
            template,
            rowHeights,
            rowConnections,
            widthPixels,
        };
        nodeDatas[nodeIndex] = nodeData;
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
    }

    return connectionData;
}
