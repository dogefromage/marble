import { RowT, RowZ } from "../../types";

// chad function
export function assertRowHas<T extends RowT>(row: RowZ, ...properties: string[]): row is RowZ & T
{
    return properties.every(p => Object.hasOwn(row, p));
}

export function assertIsZippedRow<T extends RowT>(row: T | RowZ<T>): row is RowZ<T>
{
    return Object.hasOwn(row, 'connectedOutputs');
}