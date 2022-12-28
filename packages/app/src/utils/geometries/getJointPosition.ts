import { NODE_WIDTH } from "../../styles/GeometryNodeDiv";
import { GNODE_ROW_UNIT_HEIGHT } from "../../styles/GeometryRowDiv";
import { GeometryJointDirection } from "../../types";
import { Point } from "../../types/UtilityTypes";

export default function getJointPosition(nodePosition: Point, heightUnits: number, direction: GeometryJointDirection)
{
    // let x = 23 + JOINT_OFFSET;
    let x = -9
    
    if (direction === 'output')
        x = NODE_WIDTH - x;

    const y = (heightUnits + 0.5) * GNODE_ROW_UNIT_HEIGHT;

    return {
        x: nodePosition.x + x,
        y: nodePosition.y + y,
    }
}