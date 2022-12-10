import { getRowMetadata } from "../../components/GeometryRowRoot";
import { GNodeS, RowT } from "../../types";

export default function countHeightUnits(rowTemplates: RowT[], nodeState: GNodeS, rowIndex: number, subEdgeIndex = 0)
{
    let totalHeight = 0;
    let counterMax = Math.min(rowIndex, rowTemplates.length);

    for (let rowCounter = 0; rowCounter < counterMax; rowCounter++)
    {
        const rowTemplate = rowTemplates[rowCounter];
        const rowState = nodeState.rows[rowTemplate.id];
        const isConnected = false;

        const meta = getRowMetadata({ 
            template: rowTemplate, 
            state: rowState, 
            isConnected
        });
        
        let heightUnits = meta.heightUnits;

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