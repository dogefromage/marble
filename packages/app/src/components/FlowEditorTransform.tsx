import { useDroppable, useMouseDrag } from '@marble/interactive';
import { vec2 } from 'gl-matrix';
import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectSingleFlow } from '../slices/flowsSlice';
import { CAMERA_MAX_ZOOM, CAMERA_MIN_ZOOM, flowEditorPanelsUpdateCamera, flowEditorSetSelection, flowEditorSetStateAddNodeWithConnection, flowEditorSetStateNeutral, flowEditorUpdateDragginLinkPosition } from '../slices/panelFlowEditorSlice';
import MouseSelectionDiv from '../styles/MouseSelectionDiv';
import { FLOW_NODE_ROW_HEIGHT } from '../styles/flowStyles';
import { PlanarCamera, Rect, Vec2, ViewTypes } from '../types';
import { clamp, rectanglesIntersect } from '../utils/math';
import { pointScreenToWorld } from '../utils/planarCameraMath';
import FlowEditorContent from './FlowEditorContent';
import { DRAG_JOIN_DND_TAG } from './FlowJoint';
import { FLOW_NODE_DIV_CLASS } from './FlowNodeElement';
import _ from 'lodash';

const defaultPlanarCamera: PlanarCamera = {
    position: { x: 0, y: 0 },
    zoom: 1,
}

interface DivProps {
    camera: PlanarCamera;
}

const BackgroundDiv = styled.div.attrs<DivProps>(({ camera }) => {
    const translate = vec2.fromValues(-camera.position.x, -camera.position.y);
    const gridSize = 2 * FLOW_NODE_ROW_HEIGHT * camera.zoom;
    const pos = vec2.scale(vec2.create(), translate, camera.zoom);
    return {
        style: {
            '--translate-x': `${translate[0]}px`,
            '--translate-y': `${translate[1]}px`,
            '--zoom': camera.zoom,
            '--grid-size': `${gridSize}px`,
            '--bg-pos-x': `${pos[0]}px`,
            '--bg-pos-y': `${pos[1]}px`,
        }
    }
}) <DivProps>`
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: ${({ theme }) => theme.colors.flowEditor.background};
    background-position: var(--bg-pos-x) var(--bg-pos-y);
    background-size: var(--grid-size) var(--grid-size);
    --grid-color: ${({ theme }) => theme.colors.flowEditor.backgroundDots};
    background-image: radial-gradient(var(--grid-color) calc(0.04 * var(--grid-size)), transparent 0);
`;

const TransformingDiv = styled.div`
    width: 100%;
    height: 100%;
    transform-origin: top left;
    transform: 
        scale(var(--zoom)) 
        translate(var(--translate-x), var(--translate-y)
    );
`;

interface Props {
    flowId: string;
    panelId: string;
}

const FlowEditorTransform = ({ flowId, panelId }: Props) => {
    const dispatch = useAppDispatch();
    const panelState = useAppSelector(selectPanelState(ViewTypes.FlowEditor, panelId));
    const panelStateRef = useRef(panelState);
    panelStateRef.current = panelState;
    const getPanelState = useCallback(() => {
        return panelStateRef.current!;
    }, [panelStateRef]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const getOffsetPoint = (clientPoint: Vec2) => {
        if (!wrapperRef.current) return;
        const bounds = wrapperRef.current.getBoundingClientRect();
        return {
            x: clientPoint.x - bounds.left,
            y: clientPoint.y - bounds.top,
        };
    }

    const selectionRef = useRef<{ startPoint: Vec2 }>();
    const [selection, setSelection] = useState<Rect>();
    const panRef = useRef<{ lastMouse: Vec2, lastCamera: PlanarCamera }>();
    const isActionOngoingRef = useRef(false);

    const { handlers: panHandlers, catcher: panCatcher } = useMouseDrag([
        {
            mouseButton: 0,
            start: e => {
                const startPoint = getOffsetPoint({ x: e.clientX, y: e.clientY });
                if (!startPoint) return;
                selectionRef.current = { startPoint };
            },
            move: e => {
                const startPoint = selectionRef.current?.startPoint;
                const endPoint = getOffsetPoint({ x: e.clientX, y: e.clientY });
                if (!startPoint || !endPoint) return;

                const left = Math.min(startPoint.x, endPoint.x);
                const top = Math.min(startPoint.y, endPoint.y);
                const right = Math.max(startPoint.x, endPoint.x);
                const bottom = Math.max(startPoint.y, endPoint.y);

                setSelection({
                    x: left,
                    y: top,
                    w: right - left,
                    h: bottom - top,
                });
                isActionOngoingRef.current = true;
            },
            end: e => {
                setSelection(undefined);
                isActionOngoingRef.current = false;
                if (!selection) return;
                const nodeDivs = Array.from(wrapperRef.current?.querySelectorAll(`.${FLOW_NODE_DIV_CLASS}`) || []);
                const intersectingNodes = nodeDivs.filter(item => {
                    const clientBounds = item.getBoundingClientRect();
                    const offsetPoint = getOffsetPoint(clientBounds);
                    if (!offsetPoint) return false;
                    const offsetNode: Rect = {
                        ...offsetPoint,
                        w: clientBounds.width,
                        h: clientBounds.height
                    };
                    return rectanglesIntersect(offsetNode, selection);
                });
                const intersectingIds = intersectingNodes
                    .map(node => node.getAttribute('data-id'))
                    .filter(id => id != null) as string[];
                dispatch(flowEditorSetSelection({
                    panelId,
                    selection: intersectingIds,
                }));
            }
        },
        {
            mouseButton: 1,
            start: e => {
                if (!panelState || isActionOngoingRef.current) return;
                panRef.current = {
                    lastMouse: { x: e.clientX, y: e.clientY },
                    lastCamera: panelState.camera,
                }
            },
            move: e => {
                if (!panRef.current) return;
                const deltaScreen = {
                    x: panRef.current.lastMouse.x - e.clientX,
                    y: panRef.current.lastMouse.y - e.clientY,
                };
                const position = pointScreenToWorld(panRef.current.lastCamera, deltaScreen);
                dispatch(flowEditorPanelsUpdateCamera({
                    panelId,
                    newCamera: { position }
                }));
                e.preventDefault();
                isActionOngoingRef.current = true;
            },
            end: e => { isActionOngoingRef.current = false; }
        },
    ]);

    const onWheel = (e: React.WheelEvent) => {
        if (!panelState || isActionOngoingRef.current) return;
        const zoomFactor = 1.1;
        const k = Math.pow(zoomFactor, -e.deltaY / 100);
        const ps = getOffsetPoint({ x: e.clientX, y: e.clientY });
        if (!ps) return;
        const cam = panelState.camera;
        // taken from mycel\daw\views\node_editor\components\NodeEditorView\NodeEditorGUI.tsx
        const z1 = cam.zoom;
        const z2 = clamp(z1 * k, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
        const x1 = { x: cam.position.x, y: cam.position.y };
        if (z1 * z2 === 0) return console.error(`Zoom values cannot be 0`);
        const zz = 1 / z1 - 1 / z2;
        const newCamera: PlanarCamera = {
            position: {
                x: x1.x + zz * ps.x,
                y: x1.y + zz * ps.y,
            },
            zoom: z2,
        };
        dispatch(flowEditorPanelsUpdateCamera({
            panelId,
            newCamera: newCamera,
        }));
    };

    const prevDefault = (e: React.DragEvent) => e.preventDefault();

    const getOffsetCursor = (clientPos: Vec2) => {
        const bounds = wrapperRef.current?.getBoundingClientRect();
        if (!bounds) return;
        const offsetCursor: Vec2 = {
            x: clientPos.x - bounds.left,
            y: clientPos.y - bounds.top,
        }
        return offsetCursor;
    }

    const updatePosition = useCallback(
        _.throttle((clientPos: Vec2) => {
            const offsetCursor = getOffsetCursor(clientPos);
            if (!offsetCursor) return;
            dispatch(flowEditorUpdateDragginLinkPosition({
                panelId, offsetCursor,
            }));
        }, 16),
        [ dispatch, panelId, wrapperRef ]
    );

    const { handlers: dragJointHandler } = useDroppable({
        tag: DRAG_JOIN_DND_TAG,
        enter: prevDefault,
        leave: prevDefault,
        over(e) {
            if (wrapperRef.current == null)
                return;
            updatePosition({
                x: e.clientX,
                y: e.clientY,
            });
            prevDefault(e);
        },
        drop: e => {
            const clientPosition = { x: e.clientX, y: e.clientY };
            const offsetPosition = getOffsetCursor(clientPosition);
            if (!offsetPosition) return;
            dispatch(flowEditorSetStateAddNodeWithConnection({ 
                panelId,
                clientPosition,
                offsetPosition,
            }));
            updatePosition.cancel();
        },
    });

    return (
        <BackgroundDiv
            ref={wrapperRef}
            onWheel={onWheel}
            camera={panelState?.camera || defaultPlanarCamera}
            {...panHandlers}
            {...dragJointHandler}
        >
            <TransformingDiv>
                {
                    flowId &&
                    <FlowEditorContent
                        panelId={panelId}
                        flowId={flowId}
                        getPanelState={getPanelState}
                    />
                }
            </TransformingDiv>
            {
                panCatcher
            }{
                selection &&
                <MouseSelectionDiv rect={selection} />
            }
        </BackgroundDiv>
    );
}

export default FlowEditorTransform;