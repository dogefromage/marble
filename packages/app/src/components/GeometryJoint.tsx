import { useDraggable, useDroppable } from '@marble/interactive';
import React from 'react';
import { useAppDispatch } from '../redux/hooks';
import { geometriesInsertIncomingElement } from '../slices/geometriesSlice';
import { GeometryJointDiv } from '../styles/GeometryJointDiv';
import { DataTypes, GeometryJointDirection, JointDndTransfer, GeometryJointLocation, JOINT_DND_TAG, GeometryIncomingElementTypes } from '../types';

interface Props
{
    geometryId: string;
    
    jointLocation: GeometryJointLocation;
    jointDirection: GeometryJointDirection;
    
    dataType: DataTypes;
    connected: boolean;
    additional?: boolean;
    isStackedInput?: boolean;
}

const GeometryJoint = ({ geometryId, jointLocation, jointDirection: direction, dataType, connected, additional, isStackedInput }: Props) =>
{
    const dispatch = useAppDispatch();

    const drag = useDraggable<JointDndTransfer>({
        tag: JOINT_DND_TAG,
        start: e => 
        {
            e.dataTransfer.setDragImage(new Image(), 0, 0);
            return {
                elementType: GeometryIncomingElementTypes.RowOutput,
                location: jointLocation,
                direction,
                dataType,
                mergeStackInput: isStackedInput || false,
            }
        },
    });

    const canDrop = (transfer: JointDndTransfer) => {
        if (transfer.elementType === GeometryIncomingElementTypes.Argument) {
            return (
                transfer.argument.dataType === dataType &&
                direction === 'input'
            );
        } else {
            return (
                transfer.dataType === dataType &&
                transfer.location.nodeId !== jointLocation.nodeId &&
                transfer.direction !== direction
            );
        }
    }

    const droppableHandler = (e: React.DragEvent, transfer: JointDndTransfer) => {
        if (canDrop(transfer)) {
            e.preventDefault();
        }
    }

    const drop = useDroppable<JointDndTransfer>({
        tag: JOINT_DND_TAG,
        enter: droppableHandler,
        over: droppableHandler,
        leave: droppableHandler,
        drop: (e, transfer) => 
        {
            if (!canDrop(transfer)) return;

            if (transfer.elementType === GeometryIncomingElementTypes.Argument) {
                dispatch(geometriesInsertIncomingElement({
                    geometryId,
                    jointLocation: jointLocation,
                    incomingElement: { 
                        type: GeometryIncomingElementTypes.Argument,
                        argument: transfer.argument,
                    },
                    isStackedInput,
                    undo: {}
                }));
            } else {
                let outputJointLocation = transfer.location;
                let inputJointLocation = jointLocation;
    
                if (direction === 'output') { // swap
                    outputJointLocation = jointLocation;
                    inputJointLocation = transfer.location;
                }
    
                dispatch(geometriesInsertIncomingElement({
                    geometryId,
                    jointLocation: inputJointLocation,
                    incomingElement: {
                        type: GeometryIncomingElementTypes.RowOutput,
                        location: outputJointLocation,
                    },
                    isStackedInput,
                    undo: {}
                }));
            }
        },
    });

    return (
        <GeometryJointDiv
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
        </GeometryJointDiv>
    );
}

export default GeometryJoint;