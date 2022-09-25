import { GNodeZ, RowTypes, RowZ } from "../../types";


export function getRowByIdAndType<T extends RowZ>(node: GNodeZ, id: string, type?: RowTypes)
{
    const index = node.rows.findIndex(node => 
    {
        if (node.id !== id) return false;
        if (type && node.type !== type) return false;
        return true;
    });

    return {
        rowIndex: index,
        row: node.rows[index] as T
    };
}