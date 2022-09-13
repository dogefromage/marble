import { useDraggable, useDroppable } from '@marble/interactive';
import React from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '../redux/hooks';
import { geometriesConnectJoints } from '../slices/GeometriesSlice/geometriesSlice';
import { DataTypes, JointDirection, JointDndTransfer, JointLocation, JOINT_DND_TAG, RowTypes } from '../slices/GeometriesSlice/types/Geometry';

const JointDiv = styled.div<{
    direction: JointDirection;
    connected: boolean;
    dataType: DataTypes;
    isHovering: boolean;
}>`
    position: absolute;

    top: 50%;

    ${({ direction }) => direction === 'input' ?
        'left: -34px' :
        'right: -34px'
    };

    width: 24px;
    height: 24px;
    /* aspect-ratio: 1; */

    transform: translateY(-50%);

    /* background-color: #ff000033;§ */

    display: flex;
    align-items: center;
    justify-content: center;

    .joint-inner
    {
        width: 12px;
        ${({ isHovering }) => isHovering ? `width: 16px` : '' };
        aspect-ratio: 1;

        background-color: ${({ theme, dataType }) => theme.colors.dataTypes[dataType] };
        border-radius: 50%;

        opacity: ${({ connected }) => connected ? 0 : 0.5 };
    }
    
    &:hover .joint-inner
    {
        opacity: 1;
    }
`;

interface Props
{
    geometryId: string;
    location: JointLocation;
    direction: JointDirection;
    connected: boolean;
    dataType: DataTypes;
}

const GeometryJoint = ({ geometryId, location, direction, connected, dataType }: Props) =>
{
    const dispatch = useAppDispatch();

    const drag = useDraggable<JointDndTransfer>({
        tag: JOINT_DND_TAG,
        start: e => 
        {
            e.dataTransfer.setDragImage(new Image(), 0, 0);

            return {
                ...location,
                direction,
            }
        },
    });

    const droppableHandler = (e: React.DragEvent, transfer: JointDndTransfer) =>
    {
        if (transfer.nodeId === location.nodeId ||
            transfer.direction === direction)
            return;

        e.preventDefault();
    }

    const drop = useDroppable<JointDndTransfer>({
        tag: JOINT_DND_TAG,
        enter: droppableHandler,
        over: droppableHandler,
        leave: droppableHandler,
        drop: (e, transfer) => 
        {
            if (direction === 'input')
            {
                dispatch(geometriesConnectJoints({
                    geometryId,
                    inputJoint: location,
                    outputJoint: transfer,
                    undo: {}
                }));
            }
            else
            {
                dispatch(geometriesConnectJoints({
                    geometryId,
                    inputJoint: transfer,
                    outputJoint: location,
                    undo: {}
                }));
            }
        },
    });

    return (
        <JointDiv
            direction={direction}
            connected={connected}
            dataType={dataType}
            { ...drag.handlers }
            { ...drop.handlers }
            onMouseDown={e => e.stopPropagation()}
            isHovering={drop.isHovering}
        >
            <div className='joint-inner'/>
        </JointDiv>
    );
}

export default GeometryJoint;