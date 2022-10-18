import { getRowMetadata } from "../../components/GeometryRowRoot";
import { GenericRowT } from "../../types";

export default function countHeightUnits(rows: GenericRowT[], rowIndex: number)
{
    let totalHeight = 0;

    for (let rowCounter = 0; rowCounter < Math.min(rowIndex, rows.length); rowCounter++)
    {
        const rowMetadata = getRowMetadata(rows[rowCounter]);
        totalHeight += rowMetadata.heightUnits;
    }

    return totalHeight;
}