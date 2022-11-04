import { GeometryS, GeometryZ, GNodeT, GNodeZ, RowZ } from "../../types";
import { ObjMap } from "../../types/UtilityTypes";

class ZipError extends Error
{
    constructor(msg: string) 
    {
        super(msg);
    }
}

export default function zipGeometry(g: GeometryS, templates: ObjMap<GNodeT>)
{
    const getTemplate = (templateId: string) =>
    {
        const template = templates[templateId];
        if (!template)
            throw new ZipError(`Template "${templateId}" not found`);
        return template;
    }

    try
    {
        const z: GeometryZ = 
        {
            ...g,
            nodes: g.nodes.map(node =>
            {
                const t = getTemplate(node.templateId);
    
                const rows = t.rows.map(rowT =>
                {
                    const rowS = node.rows[rowT.id];
                    
                    // @ts-ignore
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
                    operationOptions: t.operationOptions,
                    includeIds: t.includeIds,
                    rows,
                }
    
                return nodeZ;
            })
        };

        return z;
    }
    catch (e)
    {
        if (e instanceof ZipError) return
        throw e;
    }
}