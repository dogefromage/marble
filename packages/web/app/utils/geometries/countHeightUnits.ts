import { getRowMetadata } from "../../components/GeometryRowRoot";
import { RowT } from "../../types";

export default function countHeightUnits(rows: RowT[], rowIndex: number, subEdgeIndex = 0)
{
    let totalHeight = 0;

    let counterMax = Math.min(rowIndex, rows.length);

    for (let rowCounter = 0; rowCounter < counterMax; rowCounter++)
    {
        let heightUnits = getRowMetadata(rows[rowCounter]).heightUnits;

        /**
         * ONLY last row can have subIndices
         */
        if (rowCounter === counterMax - 1)
        {
            heightUnits += heightUnits * subEdgeIndex;
        }

        totalHeight += heightUnits;
    }

    return totalHeight;
}