import { GeometryJointLocation } from "../../types";

export function jointLocationHash(location: GeometryJointLocation)
{
    return [ location.nodeId, location.rowId, location.subIndex ].join('_');
}

export function rowLocationHash(args: { nodeId: string, rowId: string })
{
    return [ args.nodeId, args.rowId ].join('_');
}