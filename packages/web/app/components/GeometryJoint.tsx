import { useDraggable, useDroppable } from '@marble/interactive';
import React from 'react';
import styled, { css } from 'styled-components';
import { useAppDispatch } from '../redux/hooks';
import { geometriesConnectJoints } from '../slices/geometriesSlice';
import { GNODE_ROW_UNIT_HEIGHT } from '../styled/GeometryRowDiv';
import { DataTypes, JointDirection, JointDndTransfer, JointLocation, JOINT_DND_TAG } from '../types';

export const JOINT_OFFSET = -32;

const JointDiv = styled.div<{
    direction: JointDirection;
    connected: boolean;
    additional?: boolean;
    dataType: DataTypes;
    isHovering: boolean;
}>`
    position: absolute;

    /* top: 50%; */
    top: ${0.5 * GNODE_ROW_UNIT_HEIGHT}px;

    ${({ direction }) => 
        `${ direction === 'input' ? 
            'left' : 'right'}: ${JOINT_OFFSET}px` 
    };

    /* width: 24px; */
    width: 30px;
    border-radius: 50%;
    aspect-ratio: 1;

    transform: translateY(-50%);

    /* background-color: #ff000033; */

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

        ${({ additional, theme, dataType }) => additional ? css`
            background-color: unset;
            outline: solid 3px ${theme.colors.dataTypes[dataType]};
            outline-offset: -3px;
        ` : ''} 

        opacity: ${({ connected, isHovering }) => 
        {
            if (isHovering) return 1;
            if (connected) return 0;
            return 0.5;
        }};
    }
    
    &:hover .joint-inner
    {
        opacity: 1;
    }
`;

interface Props
{
    geometryId: string;
    panelId: string;
    location: JointLocation;
    direction: JointDirection;
    dataType: DataTypes;
    connected: boolean;
    additional?: boolean;
    isStackedInput?: true;
}

const GeometryJoint = ({ geometryId, panelId, location, direction, dataType, connected, additional, isStackedInput }: Props) =>
{
    const dispatch = useAppDispatch();

    const drag = useDraggable<JointDndTransfer>({
        tag: JOINT_DND_TAG,
        start: e => 
        {
            e.dataTransfer.setDragImage(new Image(), 0, 0);

            return {
                location,
                direction,
                dataType,
                mergeStackInput: isStackedInput || false,
            }
        },
    });

    const canDrop = (transfer: JointDndTransfer) => {
        if (transfer.location.nodeId === location.nodeId)
            return false;
        if (transfer.direction === direction)
            return false;
        return true;
    }

    const droppableHandler = (e: React.DragEvent, transfer: JointDndTransfer) => {
        if (canDrop(transfer)) e.preventDefault();
    }

    const drop = useDroppable<JointDndTransfer>({
        tag: JOINT_DND_TAG,
        enter: droppableHandler,
        over: droppableHandler,
        leave: droppableHandler,
        drop: (e, transfer) => 
        {
            if (!canDrop(transfer)) return;

            if (direction === 'input')
            {
                dispatch(geometriesConnectJoints({
                    geometryId,
                    inputJoint: location,
                    inputDataType: dataType,
                    outputJoint: transfer.location,
                    outputDataType: transfer.dataType,
                    mergeStackInput: isStackedInput || false,
                    undo: {}
                }));
            }
            else
            {
                dispatch(geometriesConnectJoints({
                    geometryId,
                    inputJoint: transfer.location,
                    inputDataType: dataType,
                    outputJoint: location,
                    outputDataType: transfer.dataType,
                    mergeStackInput: transfer.mergeStackInput,
                    undo: {}
                }));
            }
        },
    });

    return (
        <JointDiv
            direction={direction}
            connected={connected}
            additional={additional}
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