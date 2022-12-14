import { getRowMetadata } from "../../components/GeometryRowRoot";
import { GNodeS, GNodeT, RowT } from "../../types";

export function countHeightUnits(rowTemplates: RowT[], nodeState: GNodeS, rowIndex: number, subEdgeIndex = 0)
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

export function generateNodeRowHeights(state: GNodeS, template: GNodeT, connections: Set<string>) {

    const heights: number[] = [ 0 ];

    for (let i = 0; i < template.rows.length - 1; i++)
    {
        const rowTemplate = template.rows[i];
        const rowId = rowTemplate.id;

        const meta = getRowMetadata({ 
            template: rowTemplate, 
            state: state.rows[rowId], 
            isConnected: connections.has(rowId),
        });

        heights.push(heights[i] + meta.heightUnits)
    }

    return heights;
}