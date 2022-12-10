import { GeometryS, ObjMap, GNodeT, GeometryTemplateMap, GeometryNodeRowOrder, GeometryConnectionData } from "../../types";
import findConnectedRows from "./findConnectedRows";
import { generateAdjacencyLists } from "./generateAdjacencyLists";

export default function generateGeometryConnectionData(geometry: GeometryS, templates: ObjMap<GNodeT>)
{
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

    const { forwardEdges, backwardEdges, strayConnectedJoints } = generateAdjacencyLists(geometry, rowOrders, templateMap);

    const connectedRows = findConnectedRows(geometry, rowOrders, forwardEdges);

    const connectionData: GeometryConnectionData = {
        geometryId: geometry.id,
        compilationValidity: geometry.compilationValidity,
        templateMap,
        rowOrders,
        forwardEdges,
        backwardEdges,
        connectedRows,
        strayConnectedJoints,
    }

    return connectionData;
}