import { GeometryS, ObjMap, GNodeT, GeometryTemplateMap, GeometryNodeRowOrder, GeometryConnectionData, GeometryRowHeights, Rect, RowTypes, Size } from "../../types";
import findConnectedRows from "./findConnectedRows";
import { generateAdjacencyLists } from "./generateAdjacencyLists";
import { generateNodeRowHeights } from "./rowHeights";

export default function generateGeometryConnectionData(geometry: GeometryS, templates: ObjMap<GNodeT>)
{
    // templates, row order
    const templateMap: GeometryTemplateMap = new Map<string, GNodeT>();
    const rowOrders: GeometryNodeRowOrder = new Map<string, string[]>();
    for (const node of geometry.nodes)
    {
        const template = templates[node.templateId];
        if (!template) throw new Error(`Template "${node.templateId}" not found`);
        templateMap.set(node.id, templates[node.templateId]);
        const rowOrder = template.rows.map(row => row.id);
        rowOrders.set(node.id, rowOrder);
    }

    // adjacenyList
    const { forwardEdges, backwardEdges, strayConnectedJoints } = generateAdjacencyLists(geometry, rowOrders, templateMap);

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
        rowOrders,
        rowHeights,
        nodeHeights,
        forwardEdges,
        backwardEdges,
        connectedRows,
        strayConnectedJoints,
    }

    return connectionData;
}