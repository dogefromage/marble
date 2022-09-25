
// export function generateEdgeSymbol(fromNode: number, fromRow: number, toNode: number, toRow: number)
// {
//     return [ 'edge', fromNode, fromRow, toNode, toRow ].join('_');
// }

export function generateEdgeSymbol(fromNode: number, fromRow: number)
{
    return [ 'edge_from', fromNode, fromRow ].join('_');
}

export function generateConstantSymbol(node: number, row: number)
{
    return [ 'const_to', node, row ].join('_');
}