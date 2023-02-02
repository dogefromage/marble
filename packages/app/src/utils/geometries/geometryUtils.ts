import { getRowMetadata } from "../../components/GeometryRowRoot";
import { DEFAULT_NODE_WIDTH } from "../../styles/GeometryNodeDiv";
import { GNODE_ROW_UNIT_HEIGHT } from "../../styles/GeometryRowDiv";
import { GeometryJointDirection, GNodeData, GNodeState, GNodeTemplate } from "../../types";
import { ObjMap, Point } from "../../types/UtilityTypes";

export default function getJointPositionWorld(nodePosition: Point, heightUnits: number, nodeWidth: number, direction: GeometryJointDirection) {
    let relX = -9
    if (direction === 'output') {
        relX = nodeWidth - relX;
    }
    const relY = (heightUnits + 0.5) * GNODE_ROW_UNIT_HEIGHT;
    return {
        x: relX + nodePosition.x,
        y: relY + nodePosition.y,
    }
}

export function readNodeSizes(state: GNodeState, template: GNodeTemplate, rowConnections: ObjMap<number>) {
    const rowHeights: GNodeData[ 'rowHeights' ] = [ 0 ];
    let widthPixels = 0;

    for (let i = 0; i < template.rows.length; i++) {
        const rowTemplate = template.rows[ i ];
        const rowState = state.rows[ rowTemplate.id ];
        const numConnectedJoints = rowConnections[ rowTemplate.id ];

        const meta = getRowMetadata({
            template: rowTemplate,
            state: rowState,
            numConnectedJoints,
        });

        rowHeights.push(rowHeights[ i ] + meta.heightUnits)
        widthPixels = Math.max(widthPixels, meta.minWidth);
    }

    return { widthPixels, rowHeights };
}