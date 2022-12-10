import { RowT, RowZ } from "../../types";

// chad function
export function assertRowZHas<T extends RowT>(row: RowZ, ...properties: string[]): row is RowZ & T
{
    return properties.every(p => Object.hasOwn(row, p));
}

// chad function 2
export function assertRowTHas<T extends RowT>(row: RowT, ...properties: string[]): row is T
{
    return properties.every(p => Object.hasOwn(row, p));
}