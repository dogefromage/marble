import { JOINT_OFFSET } from "../../components/GeometryJoint";
import { NODE_WIDTH } from "../../components/GeometryNode";
import { GNODE_ROW_UNIT_HEIGHT } from "../../styled/GeometryRowDiv";
import { JointDirection } from "../../types";
import { Point } from "../../types/utils";

export default function getJointPosition(nodePosition: Point, heightUnits: number, direction: JointDirection)
{
    let x = 20 + JOINT_OFFSET;
    
    if (direction === 'output')
        x = NODE_WIDTH - x;

    const y = (heightUnits + 0.5) * GNODE_ROW_UNIT_HEIGHT;

    return {
        x: nodePosition.x + x,
        y: nodePosition.y + y,
    }
}