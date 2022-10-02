import { GNodeZ } from "../../types";
import { getRowHeightRoot } from '../../components/GeometryRowRoot';

export default function countHeightUnits(node: GNodeZ, rowIndex: number)
{
    let totalHeight = 0;

    for (let rowCounter = 0; rowCounter < rowIndex; rowCounter++)
    {
        const singleRowHeight = getRowHeightRoot(node.rows[rowCounter]);
        totalHeight += singleRowHeight;
    }

    return totalHeight;
}