// import { GNodeS, RowT, RowTypes, RowZ } from "../../types";

// export function getRowById<T extends RowT>(node: GNodeS, id: string, rowType?: RowTypes)
// {
//     const index = node.rows.findIndex(node => node.id === id);
//     if (index < 0) return;
    
//     const row = node.rows[index];
    
//     if (rowType && row.type !== rowType)
//         throw new Error(`Row is not of type`)

//     const rowInfo = {
//         rowIndex: index,
//         row: row as any as RowZ<T>
//     };

//     return rowInfo;
// }

export {}