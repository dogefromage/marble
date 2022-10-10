import { RowMetadata } from "../../types";

export default function rowMeta(heightUnits = 1, dynamicValue = false): RowMetadata
{
    return { heightUnits, dynamicValue };
}