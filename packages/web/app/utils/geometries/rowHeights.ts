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

        const meta = getRowMetadata({ 
            template: rowTemplate, 
            state: rowState, 
            numConnectedJoints: 0,
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

export function generateNodeRowHeights(state: GNodeS, template: GNodeT, connectedRows: Set<string>) {

    const heights: number[] = [ 0 ];

    for (let i = 0; i < template.rows.length; i++)
    {
        const rowTemplate = template.rows[i];
        const rowState = state.rows[rowTemplate.id];
        const ingoingConnection = connectedRows.has(rowTemplate.id) ? 1 : 0;
        const numConnectedJoints = Math.max(rowState.incomingElement.length, ingoingConnection);

        const meta = getRowMetadata({ 
            template: rowTemplate, 
            state: rowState,
            numConnectedJoints,
        });

        heights.push(heights[i] + meta.heightUnits)
    }

    return heights;
}