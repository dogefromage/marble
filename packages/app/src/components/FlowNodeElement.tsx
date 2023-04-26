import { useMouseDrag } from '@marble/interactive';
import { FlowNode, FlowNodeContext } from '@marble/language';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch } from '../redux/hooks';
import { flowsMoveSelection } from '../slices/flowsSlice';
import { flowEditorSetSelection } from '../slices/panelFlowEditorSlice';
import { FlowNodeDiv } from '../styles/flowStyles';
import { FlowEditorPanelState } from '../types';
import { SelectionStatus, Vec2 } from '../types/UtilityTypes';
import { vectorScreenToWorld } from '../utils/planarCameraMath';
import FlowNodeContent from './FlowNodeContent';
import { FlowNodeMissingContent } from './FlowNodeMissingContent';

export const FLOW_NODE_DIV_CLASS = 'flow-node-div';

interface Props {
    panelId: string;
    flowId: string;
    node: FlowNode;
    context: FlowNodeContext;
    getPanelState: () => FlowEditorPanelState;
    selectionStatus: SelectionStatus;
}

const FlowNodeElement = ({ panelId, flowId, node, context, getPanelState, selectionStatus }: Props) => {
    const dispatch = useAppDispatch();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const getClientNodePos = useCallback(() => {
        const rect = wrapperRef.current!.getBoundingClientRect();
        return { x: rect.x, y: rect.y } as Vec2;
    }, [ wrapperRef ]);

    const dragRef = useRef<{
        startCursor: Vec2;
        lastCursor: Vec2;
        startPosition: Vec2;
        stackToken: string;
    }>();

    const ensureSelection = () => {
        if (selectionStatus !== SelectionStatus.Selected) {
            dispatch(flowEditorSetSelection({
                panelId,
                selection: [node.id],
            }));
        }
    }

    const { handlers, catcher } = useMouseDrag({
        mouseButton: 0,
        start: e => {
            dragRef.current =
            {
                startCursor: { x: e.clientX, y: e.clientY },
                lastCursor: { x: e.clientX, y: e.clientY },
                startPosition: { ...node.position },
                stackToken: 'drag_node:' + uuidv4(),
            };
            e.stopPropagation();
            ensureSelection();
        },
        move: e => {
            const { camera, selection } = getPanelState();

            if (!dragRef.current || !camera) return;

            const screenDelta = {
                x: e.clientX - dragRef.current.lastCursor.x,
                y: e.clientY - dragRef.current.lastCursor.y,
            };
            const worldMove = vectorScreenToWorld(camera, screenDelta);
            dragRef.current.lastCursor = { x: e.clientX, y: e.clientY };

            dispatch(flowsMoveSelection({
                flowId,
                selection,
                delta: worldMove,
                undo: {
                    actionToken: dragRef.current!.stackToken,
                    desc: `Moved selection in active geometry.`
                },
            }));
        },
    }, {
        cursor: 'grab',
    });
    
    
    const [color, setColor] = useState('#ffffff');
    useEffect(() => {
        // console.log(`ROW UPDATE ${row.id}`);
        setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`);
    }, [context])


    return (
        <FlowNodeDiv
            position={node.position}
            selectionStatus={selectionStatus}
            {...handlers}
            className={FLOW_NODE_DIV_CLASS}
            data-id={node.id} // for DOM querying node ids
            onClick={e => {
                e.stopPropagation();
            }}
            onContextMenu={() => ensureSelection()} // context will be triggered further down in tree
            ref={wrapperRef}
            debugOutlineColor={color}
        // onDoubleClick={e => {
        //     // enter nested geometry
        //     if (nodeData?.template == null) {
        //         return;
        //     }
        //     const { id: subGeoId, type: templateType } = decomposeTemplateId(nodeData.template.id);
        //     if (templateType === 'composite') {
        //         dispatch(geometryEditorPanelsPushGeometryId({
        //             panelId,
        //             geometryId: subGeoId,
        //         }));
        //         e.stopPropagation();
        //     }
        // }}
        >
            {
                context.templateSignature ? (
                    <FlowNodeContent
                        panelId={panelId}
                        flowId={flowId}
                        nodeId={node.id}
                        context={context}
                        signature={context.templateSignature}
                        getClientNodePos={getClientNodePos}
                    />
                ) : (
                    <FlowNodeMissingContent />
                )
            }
            {catcher}
        </FlowNodeDiv >
    );
}

export default React.memo(FlowNodeElement);