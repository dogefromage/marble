import { getMaxListeners } from "process";
import { GeometryS, ObjMap, GNodeT, GeometryTemplateMap, GeometryNodeRowOrder, GeometryConnectionData, GeometryRowHeights, Rect, RowTypes, Size } from "../../types";
import findConnectedRows from "./findConnectedRows";
import { generateAdjacencyLists } from "./generateAdjacencyLists";
import { generateNodeRowHeights } from "./rowHeights";

export default function generateGeometryConnectionData(geometry: GeometryS, templates: ObjMap<GNodeT>)
{
    const N = geometry.nodes.length;

    // templates, row order
    const nodeTemplates: GNodeT[] = new Array(N);
    const templateMap: GeometryTemplateMap = new Map<string, GNodeT>();
    const rowOrders: GeometryNodeRowOrder = new Map<string, string[]>();
    const dependencies: string[] = [];
    for (let i = 0; i < N; i++)
    {
        const node = geometry.nodes[i];
        const template = templates[node.templateId];
        if (!template) throw new Error(`Template "${node.templateId}" not found`);
        nodeTemplates[i] = template;
        templateMap.set(node.id, templates[node.templateId]);
        const rowOrder = template.rows.map(row => row.id);
        rowOrders.set(node.id, rowOrder);
        if (template.sourceGeometry != null) {
            dependencies.push(template.sourceGeometry);
        }
    }

    // adjacenyList
    const { forwardEdges, backwardEdges, strayConnectedJoints, argumentConsumers } = generateAdjacencyLists(geometry, rowOrders, templateMap);

    // connectedRows
    const connectedRows = findConnectedRows(geometry, rowOrders, forwardEdges);

    // rowHeights, hitbox
    const rowHeights: GeometryRowHeights = new Map();
    const nodeHeights = new Map<string, number>();
    for (const node of geometry.nodes) {
        const template = templateMap.get(node.id)!;
        const connections = connectedRows.get(node.id)!;
        const heightList = generateNodeRowHeights(node, template, connections);
        rowHeights.set(node.id, heightList);
        // total height
        const totalHeightUnits = heightList[heightList.length];
        nodeHeights.set(node.id, totalHeightUnits);
    }

    const connectionData: GeometryConnectionData = {
        geometryId: geometry.id,
        compilationValidity: geometry.compilationValidity,
        templateMap,
        nodeTemplates,
        rowOrders,
        rowHeights,
        nodeHeights,
        forwardEdges,
        backwardEdges,
        connectedRows,
        strayConnectedJoints,
        argumentConsumers,
        dependencies,
    }

    return connectionData;
}