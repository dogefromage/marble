import React from 'react';
import { useAppDispatch } from '../redux/hooks';
import { geometriesRemoveIncomingElements } from '../slices/flowsSlice';
import { GeometryEdge, GeometryJointLocation, Vec2 } from '../types';
import GeometryLinkDiv from './GeometryLinkDiv';

interface Props {
    geometryId: string;
    edge: GeometryEdge;
    posA: Vec2;
    posB: Vec2;
    joints: GeometryJointLocation[];
}

const LinkComponent = ({
    geometryId,
    edge,
    posA,
    posB,
    joints,
}: Props) => {
    const dispatch = useAppDispatch();

    return (
        <GeometryLinkDiv
            dataType={edge.dataType}
            A={posA}
            B={posB}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => {
                dispatch(geometriesRemoveIncomingElements({
                    geometryId,
                    joints,
                    undo: { desc: `Removed link between two nodes in active geometry.` },
                }))
                e.stopPropagation();
            }}
        />
    );
}

export default LinkComponent;