

export default function rowLocationKey(node: string, row: string)
{
    return [ node, row ].join('_');
}