import { NODE_WIDTH } from "../../components/GeometryNode";
import { GNODE_ROW_UNIT_HEIGHT } from "../../components/styled/GeometryRowDiv";
import { JointDirection } from "../../slices/GeometriesSlice/types/Geometry";
import { Point } from "../types/common";

export default function getJointPosition(nodePosition: Point, heightUnits: number, direction: JointDirection)
{
    let x = -14;
    if (direction === 'output')
        x = NODE_WIDTH - x;

    const y = (heightUnits + 0.5) * GNODE_ROW_UNIT_HEIGHT;

    return {
        x: nodePosition.x + x,
        y: nodePosition.y + y,
    }
}