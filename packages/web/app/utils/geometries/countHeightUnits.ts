import { getRowMetadata } from "../../components/GeometryRowRoot";
import { GNodeZ } from "../../types";

export default function countHeightUnits(node: GNodeZ, rowIndex: number)
{
    let totalHeight = 0;

    for (let rowCounter = 0; rowCounter < rowIndex; rowCounter++)
    {
        const rowMetadata = getRowMetadata(node.rows[rowCounter]);
        totalHeight += rowMetadata.heightUnits;
    }

    return totalHeight;
}