import { GeometryConnectionData, GeometryNodeRowOrder, GeometryRowHeights, GeometryS, GeometryTemplateMap, GNodeT, GNodeTemplateTypes, ObjMap } from "../../types";
import findConnectedRows from "./findConnectedRows";
import { generateNodeAdjacencyList } from "./generateNodeAdjacencyList";
import { generateNodeRowHeights } from "./rowHeights";

export default function generateGeometryConnectionData(geometry: GeometryS, templates: ObjMap<GNodeT>)
{
    const N = geometry.nodes.length;

    // templates, row order
    const nodeTemplates: (GNodeT | null)[] = new Array(N);
    const rowOrders: GeometryNodeRowOrder = new Map<string, string[]>();
    const dependencies: string[] = [];
    for (let i = 0; i < N; i++)
    {
        const node = geometry.nodes[i];
        const template = (templates[node.templateId] || null) as GNodeT | null;
        nodeTemplates[i] = template;
        if (template) {
            const rowOrder = template.rows.map(row => row.id);
            rowOrders.set(node.id, rowOrder);
            if (template.type === GNodeTemplateTypes.Composite) {
                dependencies.push(template.id);
            }
        }
    }

    // adjacenyList
    const { forwardEdges, backwardEdges, strayConnectedJoints, argumentConsumers } = generateNodeAdjacencyList(geometry, rowOrders, nodeTemplates);

    // connectedRows
    const connectedRows = findConnectedRows(geometry, rowOrders, forwardEdges);

    // rowHeights, hitbox
    const rowHeights: GeometryRowHeights = new Map();
    const nodeHeights = new Map<string, number>();
    for (let nodeIndex = 0; nodeIndex < N; nodeIndex++) {
        const node = geometry.nodes[nodeIndex];
        const connections = connectedRows.get(node.id)!;
        const template = nodeTemplates[nodeIndex];
        if (template) {
            const heightList = generateNodeRowHeights(node, template, connections);
            rowHeights.set(node.id, heightList);
            const totalHeightUnits = heightList[heightList.length];
            nodeHeights.set(node.id, totalHeightUnits);
        }
    }

    const connectionData: GeometryConnectionData = {
        geometryId: geometry.id,
        compilationValidity: geometry.compilationValidity,
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