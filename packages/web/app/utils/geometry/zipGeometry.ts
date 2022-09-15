import { GeometryS, GeometryZ, GNodeT, GNodeZ, RowZ } from "../../types/Geometry";
import { KeyValueMap } from "../../types/utils";

export default function zipGeometry(g: GeometryS, templates: KeyValueMap<GNodeT>)
{
    const getTemplate = (templateId: string) =>
    {
        const template = templates[templateId];
        if (!template)
            throw new Error(`Template "${templateId}" not found`);
        return template;
    }

    const z: GeometryZ = 
    {
        ...g,
        nodes: g.nodes.map(node =>
        {
            const t = getTemplate(node.templateId);

            const rows = t.rows.map(rowT =>
            {
                const rowZ: RowZ = 
                {
                    ...rowT,
                    ...node.rows[rowT.id],
                }
                return rowZ;
            });

            const nodeZ: GNodeZ =
            {
                ...node,
                type: t.type,
                rows,
            }

            return nodeZ;
        })
    };

    return z;
}