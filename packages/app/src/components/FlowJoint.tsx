import { useDraggable, useDroppable } from '@marble/interactive';
import { JointLocation } from '@marble/language';
import React, { useEffect, useRef } from 'react';
import { Vec2 } from 'three';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { flowsAddLink } from '../slices/flowsSlice';
import { flowEditorSetRelativeClientJointPosition, flowEditorSetStateDraggingLink, flowEditorSetStateNeutral, selectFlowEditorPanelActionState } from '../slices/panelFlowEditorSlice';
import { FlowJointDiv } from '../styles/flowStyles';
import { DataTypes } from '../types';
import { getJointLocationKey } from '../utils/flows';

interface Props {
    panelId: string;
    flowId: string;
    location: JointLocation;
    dataType: DataTypes;
    getClientNodePos: () => Vec2;
}

export const DRAG_JOIN_DND_TAG = `drag-join`;
const JOINT_DIV_CLASS = `joint-target`;

const FlowJoint = ({ panelId, flowId, location, dataType, getClientNodePos }: Props) => {
    const dispatch = useAppDispatch();
    const actionState = useAppSelector(selectFlowEditorPanelActionState(panelId));

    const drag = useDraggable({
        tag: DRAG_JOIN_DND_TAG,
        start: e => {
            e.dataTransfer.setDragImage(new Image(), 0, 0);
            dispatch(flowEditorSetStateDraggingLink({
                panelId,
                fromJoint: location,
            }));

            return {
                // location,
                // mergeStackInput: isStackedInput || false,
            }
        },
    });

    const isDroppableTarget = (
        actionState?.type === 'dragging-link' &&
        actionState.fromJoint.nodeId !== location.nodeId &&
        actionState.fromJoint.direction !== location.direction
    );

    const droppableHandler = (e: React.DragEvent) => {
        if (isDroppableTarget) {
            e.preventDefault();
        }
    }
    const drop = useDroppable({
        tag: DRAG_JOIN_DND_TAG,
        enter: droppableHandler,
        over: droppableHandler,
        leave: droppableHandler,
        drop: e => {
            if (!isDroppableTarget) return;
            dispatch(flowsAddLink({
                flowId,
                locations: [location, actionState.fromJoint],
                undo: { desc: `Linked two nodes in active flow.` }
            }));
            dispatch(flowEditorSetStateNeutral({
                panelId,
            }));
        },
    });

    const innerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const rect = innerRef.current!.getBoundingClientRect();
        const nodePos = getClientNodePos();
        const relativePos = {
            x: rect.x + 0.5 * rect.width - nodePos.x,
            y: rect.y + 0.5 * rect.height - nodePos.y,
        };

        const jointKey = getJointLocationKey(location);

        dispatch(flowEditorSetRelativeClientJointPosition({
            panelId,
            jointKey,
            relativeClientPosition: relativePos,
        }))
    }, []);

    const cannotDrop = actionState?.type === 'dragging-link' && ! isDroppableTarget;

    return (
        <FlowJointDiv
            direction={location.direction}
            additional={false}
            dataType={dataType}
            {...drag.handlers}
            {...drop.handlers}
            cannotDrop={cannotDrop}
            onMouseDown={e => e.stopPropagation()}
        >
            <div
                className={JOINT_DIV_CLASS}
                ref={innerRef}
            />
        </FlowJointDiv>
    );
}

export default FlowJoint;