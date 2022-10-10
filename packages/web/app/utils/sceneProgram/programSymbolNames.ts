
export function generateEdgeVarName(fromNode: number, fromRow: number)
{
    return [ 'edge_from', fromNode, fromRow ].join('_');
}

export function generateTextureVarName(node: number, row: number)
{
    return [ 'texel_to', node, row ].join('_');
}

export function generateConstantName(node: number, row: number)
{
    return [ 'const_to', node, row ].join('_');
}