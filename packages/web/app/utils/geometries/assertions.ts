import { EveryRowT, RowZ } from "../../types";

// chad function

export function assertRowHas<T extends EveryRowT>(row: RowZ, ...properties: string[]): row is RowZ & T
{
    return properties.every(p => Object.hasOwn(row, p));
}
