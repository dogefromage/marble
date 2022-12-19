import { useAppDispatch } from '../redux/hooks';
import { geometriesRemoveIncomingElements } from '../slices/geometriesSlice';
import { GeometryEdge, GeometryJointLocation, Point } from '../types';
import getJointPosition from '../utils/geometries/getJointPosition';
import GeometryLinkDiv from './GeometryLinkDiv';

interface Props
{
    geometryId: string;
    edge: GeometryEdge;
    fromPosition: Point;
    fromHeightUnits: number;
    toPosition: Point;
    toHeightUnits: number;
    joints: GeometryJointLocation[];
}

const LinkComponent = ({ 
    geometryId, 
    edge, 
    fromPosition,
    fromHeightUnits,
    toPosition,
    toHeightUnits,
    joints,
}: Props) =>
{
    const dispatch = useAppDispatch();

    const A = getJointPosition(fromPosition, fromHeightUnits, 'output');
    const B = getJointPosition(toPosition,   toHeightUnits,   'input');

    return (
        <GeometryLinkDiv
            dataType={edge.dataType}
            A={A}
            B={B}
            onMouseDown={e => e.stopPropagation()}
            onClick={e =>
            {
                dispatch(geometriesRemoveIncomingElements({
                    geometryId,
                    joints,
                    undo: {},
                }))
                e.stopPropagation();
            }}
        />
    );
}

export default LinkComponent;