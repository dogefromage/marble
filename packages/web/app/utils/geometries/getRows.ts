import { GNodeZ, RowZ } from "../../types";

export function getRowById<T extends RowZ>(node: GNodeZ, id: string)
{
    const index = node.rows.findIndex(node => node.id === id);

    return {
        rowIndex: index,
        row: node.rows[index] as T
    };
}