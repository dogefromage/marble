import { getRowMetadata } from "../../components/GeometryRowRoot";
import { NODE_WIDTH } from "../../styles/GeometryNodeDiv";
import { GNODE_ROW_UNIT_HEIGHT } from "../../styles/GeometryRowDiv";
import { GeometryJointDirection, GNodeData, GNodeState, GNodeTemplate } from "../../types";
import { ObjMap, Point } from "../../types/UtilityTypes";

export default function getJointPositionWorld(nodePosition: Point, heightUnits: number, direction: GeometryJointDirection) {
    
    let relX = -9
    if (direction === 'output') {
        relX = NODE_WIDTH - relX;
    }

    const relY = (heightUnits + 0.5) * GNODE_ROW_UNIT_HEIGHT;

    return {
        x: relX + nodePosition.x,
        y: relY + nodePosition.y,
    }
}

export function generateNodeRowHeights(state: GNodeState, template: GNodeTemplate, rowConnections: ObjMap<number>) {
    const heights: GNodeData[ 'rowHeights' ] = [ 0 ];

    for (let i = 0; i < template.rows.length; i++) {
        const rowTemplate = template.rows[ i ];
        const rowState = state.rows[ rowTemplate.id ];
        const numConnectedJoints = rowConnections[ rowTemplate.id ];

        const meta = getRowMetadata({
            template: rowTemplate,
            state: rowState,
            numConnectedJoints,
        });

        heights.push(heights[ i ] + meta.heightUnits)
    }

    return heights;
}