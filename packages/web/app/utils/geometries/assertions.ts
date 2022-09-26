import { DataTypes, InputRowT, RowValue, RowZ } from "../../types";

export function hasRowDataType(row: RowZ): row is RowZ & { dataType: DataTypes }
{
    return (row as any).dataType != null;
}

export function hasRowValue(row: RowZ): row is RowZ & { value: RowValue }
{
    return (row as any).value != null;
}

