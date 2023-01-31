import React from 'react';
import { useAppDispatch } from '../redux/hooks';
import { geometriesRemoveIncomingElements } from '../slices/geometriesSlice';
import { GeometryEdge, GeometryJointLocation, Point } from '../types';
import GeometryLinkDiv from './GeometryLinkDiv';

interface Props
{
    geometryId: string;
    edge: GeometryEdge;
    posA: Point;
    posB: Point;
    joints: GeometryJointLocation[];
}

const LinkComponent = ({ 
    geometryId, 
    edge, 
    posA,
    posB,
    joints,
}: Props) =>
{
    const dispatch = useAppDispatch();

    return (
        <GeometryLinkDiv
            dataType={edge.dataType}
            A={posA}
            B={posB}
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