import { useAppDispatch } from '../redux/hooks';
import { geometriesDisconnectJoints } from '../slices/geometriesSlice';
import { GNodeZ, JointLocation } from '../types';
import countHeightUnits from '../utils/geometries/countHeightUnits';
import { GeometryEdge } from '../utils/geometries/generateAdjacencyLists';
import getJointPosition from '../utils/geometries/getJointPosition';
import GeometryLinkDiv from './GeometryLinkDiv';

interface Props
{
    geometryId: string;
    edge: GeometryEdge;
    fromNode: GNodeZ;
    toNode: GNodeZ;
}

const LinkComponent = ({ geometryId, edge, fromNode, toNode }: Props) =>
{
    const dispatch = useAppDispatch();

    const heightA = countHeightUnits(fromNode.rows, edge.fromIndices[1]);
    const A = getJointPosition(fromNode.position, heightA, 'output');
    const heightB = countHeightUnits(toNode.rows, edge.toIndices[1], edge.toIndices[2]);
    const B = getJointPosition(toNode.position, heightB, 'input');

    const joints: JointLocation[] = 
    [
        {
            nodeId: fromNode.id,
            rowId: fromNode.rows[edge.fromIndices[1]].id,
            subIndex: 0,
        },
        {
            nodeId: toNode.id,
            rowId: toNode.rows[edge.toIndices[1]].id,
            subIndex: edge.toIndices[2],
        },
    ];

    return (
        <GeometryLinkDiv
            dataType={edge.dataType}
            A={A}
            B={B}
            onClick={() =>
            {
                dispatch(geometriesDisconnectJoints({
                    geometryId,
                    joints,
                    undo: {},
                }))
            }}
        />
    );
}

export default LinkComponent;