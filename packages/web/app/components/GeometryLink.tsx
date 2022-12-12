import { useAppDispatch } from '../redux/hooks';
import { geometriesDisconnectJoints } from '../slices/geometriesSlice';
import { GeometryEdge, GNodeS, GNodeT, JointLocation } from '../types';
import countHeightUnits from '../utils/geometries/countHeightUnits';
import getJointPosition from '../utils/geometries/getJointPosition';
import GeometryLinkDiv from './GeometryLinkDiv';

interface Props
{
    geometryId: string;
    edge: GeometryEdge;
    fromNodeTemplate: GNodeT;
    fromNodeState: GNodeS;
    toNodeTemplate: GNodeT;
    toNodeState: GNodeS;
}

const LinkComponent = ({ 
    geometryId, 
    edge, 
    fromNodeTemplate,
    fromNodeState, 
    toNodeTemplate,
    toNodeState, 
}: Props) =>
{
    const dispatch = useAppDispatch();

    const heightA = countHeightUnits(fromNodeTemplate.rows, fromNodeState, edge.fromIndices[1]);
    const A = getJointPosition(fromNodeState.position, heightA, 'output');

    const heightB = countHeightUnits(toNodeTemplate.rows, toNodeState, edge.toIndices[1], edge.toIndices[2]);
    const B = getJointPosition(toNodeState.position, heightB, 'input');

    const joints: JointLocation[] = 
    [
        {
            nodeId: fromNodeState.id,
            rowId: fromNodeTemplate.rows[edge.fromIndices[1]].id,
            subIndex: 0,
        },
        {
            nodeId: toNodeState.id,
            rowId: toNodeTemplate.rows[edge.toIndices[1]].id,
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