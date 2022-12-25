import { useDroppable, useMouseDrag } from '@marble/interactive';
import { vec2 } from 'gl-matrix';
import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesSetSelectedNodes, selectGeometry } from '../slices/geometriesSlice';
import { CAMERA_MAX_ZOOM, CAMERA_MIN_ZOOM, geometryEditorPanelsUpdateCamera, geometryEditorPanelsSetNewLink } from '../slices/panelGeometryEditorSlice';
import MouseSelectionDiv from '../styles/MouseSelectionDiv';
import { DEFAULT_PLANAR_CAMERA, GeometryIncomingElementTypes, JointDndTransfer, JOINT_DND_TAG, PlanarCamera, Point, ViewTypes } from '../types';
import { pointScreenToWorld, vectorScreenToWorld } from '../utils/geometries/planarCameraMath';
import { clamp } from '../utils/math';
import GeometryEditorContent from './GeometryEditorContent';

interface DivProps
{
    camera: PlanarCamera;
}

const BackgroundDiv = styled.div.attrs<DivProps>(({ camera }) =>
{
    const translate = vec2.fromValues(-camera.position.x, -camera.position.y);
    const gridSize = 20 * camera.zoom;
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
})<DivProps>`

    width: 100%;
    height: 100%;
    overflow: hidden;

    background-color: #e0e0e0;
    --grid-thick: 1px;
    --grid-color: #c6c8cc;

    background-position: var(--bg-pos-x) var(--bg-pos-y);
    background-size: var(--grid-size) var(--grid-size);
    background-image: 
        linear-gradient(var(--grid-color) var(--grid-thick), transparent var(--grid-thick)), 
        linear-gradient(90deg, var(--grid-color) var(--grid-thick), transparent var(--grid-thick))
    ;
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

interface Props
{
    geometryId: string;
    panelId: string;
}

const GeometryEditorTransform = ({ geometryId, panelId }: Props) =>
{
    const dispatch = useAppDispatch();
    const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));
    const geometry = useAppSelector(selectGeometry(geometryId));

    const cameraRef = useRef(panelState?.camera);
    cameraRef.current = panelState?.camera;
    const getCamera = useCallback(() => cameraRef.current, [ cameraRef ]);

    const wrapperRef = useRef<HTMLDivElement>(null);

    const getOffsetPoint = (e: React.MouseEvent) => 
    {
        if (!wrapperRef.current) return;
        const bounds = wrapperRef.current.getBoundingClientRect();
        return {
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
        };
    }

    const selectionRef = useRef<{
        startPoint: Point;
    }>();
    const [ selection, setSelection ] = useState<{
        x: number, y: number, w: number, h: number,
    }>();


    const panRef = useRef<{
        lastMouse: Point;
        lastCamera: PlanarCamera;
    }>();

    const actionOngoingRef = useRef(false);

    const { handlers: panHandlers, catcher: panCatcher } = useMouseDrag([
        {
            mouseButton: 0,
            start: e => {
                const startPoint = getOffsetPoint(e);
                if (!startPoint) return;
                selectionRef.current = { startPoint };
            },
            move: e => {
                const startPoint = selectionRef.current?.startPoint;
                const endPoint = getOffsetPoint(e);
                if (!startPoint || !endPoint) return;

                const left =   Math.min(startPoint.x, endPoint.x);
                const top =    Math.min(startPoint.y, endPoint.y);
                const right =  Math.max(startPoint.x, endPoint.x);
                const bottom = Math.max(startPoint.y, endPoint.y);

                setSelection({
                    x: left,
                    y: top,
                    w: right - left,
                    h: bottom - top,
                });
                actionOngoingRef.current = true;
            },
            end: e => {
                setSelection(undefined);
                actionOngoingRef.current = false;

                if (!selection || !panelState?.camera || !geometry) return;

                const screenPos = vec2.fromValues(selection.x, selection.y);
                const screenSize = vec2.fromValues(selection.w, selection.h);

                const [ x, y ] = pointScreenToWorld(panelState.camera, screenPos);
                const [ w, h ] = vectorScreenToWorld(panelState.camera, screenSize);

                const selectedIds: string[] = [];
                
                for (const node of geometry.nodes)
                {
                    const { x: n_x, y: n_y } = node.position;

                    if (x <= n_x && n_x <= x + w &&
                        y <= n_y && n_y <= y + h)
                    {
                        selectedIds.push(node.id);
                    }
                }
                
                dispatch(geometriesSetSelectedNodes({
                    geometryId,
                    selection: selectedIds,
                    undo: {},
                })); 
            }
        },
        {
            mouseButton: 1,
            start: e => {
                if (!panelState || actionOngoingRef.current) return;
                panRef.current = {
                    lastMouse: { x: e.clientX, y: e.clientY },
                    lastCamera: panelState.camera,
                }
            },
            move: e => {
                if (!panRef.current) return;
                const deltaScreen = vec2.fromValues(
                    panRef.current.lastMouse.x - e.clientX,
                    panRef.current.lastMouse.y - e.clientY,
                );
                const deltaWorld = vectorScreenToWorld(panRef.current.lastCamera, deltaScreen);
                const position: Point =
                {
                    x: panRef.current.lastCamera.position.x + deltaWorld[0],
                    y: panRef.current.lastCamera.position.y + deltaWorld[1],
                };
                dispatch(geometryEditorPanelsUpdateCamera({
                    panelId,
                    newCamera: { position }
                }));
                e.preventDefault();
                actionOngoingRef.current = true;
            },
            end: e => { actionOngoingRef.current = false; }
        },
    ]);

    const onWheel = (e: React.WheelEvent) =>
    {
        if (!panelState || actionOngoingRef.current) return;

        const zoomFactor = 1.1;
        const k = Math.pow(zoomFactor, -e.deltaY / 100);

        const ps = getOffsetPoint(e);
        if (!ps) return;

        const cam = panelState.camera;

        // taken from mycel\daw\views\node_editor\components\NodeEditorView\NodeEditorGUI.tsx
        const z1 = cam.zoom;
        const z2 = clamp(z1 * k, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
        const x1 = { x: cam.position.x, y: cam.position.y };

        if (z1 * z2 === 0) return console.error(`Zoom values cannot be 0`);

        const zz = 1 / z1 - 1 / z2;
        
        const newCamera: PlanarCamera =
        {
            position: {
                x: x1.x + zz * ps.x,
                y: x1.y + zz * ps.y,
            },
            zoom: z2,
        };

        dispatch(geometryEditorPanelsUpdateCamera({
            panelId,
            newCamera: newCamera,
        }));
    };

    const prevDefault = (e: React.DragEvent) => e.preventDefault();
    const lastCallTime = useRef(0);

    const { handlers: dragJointHandler } = useDroppable<JointDndTransfer>({
        tag: JOINT_DND_TAG,
        enter: prevDefault,
        leave: prevDefault,
        over(e, transfer)
        {
            if (wrapperRef.current == null || 
                transfer.elementType !== GeometryIncomingElementTypes.RowOutput) {
                    return;
                }

            const time = new Date().getTime();
            if (lastCallTime.current < time - 20)
            {
                lastCallTime.current = time;

                const bounds = wrapperRef.current.getBoundingClientRect();
                const offsetPos = 
                {
                    x: e.clientX - bounds.left,
                    y: e.clientY - bounds.top,
                };

                dispatch(geometryEditorPanelsSetNewLink({
                    panelId,
                    newLink: {
                        location: transfer.location,
                        dataType: transfer.dataType,
                        direction: transfer.direction,
                        offsetPos,
                    },
                }));
            }
            prevDefault(e);
        },
        drop: e => {
            dispatch(geometryEditorPanelsSetNewLink({
                panelId,
                newLink: null,
            }));
        }
    });

    const clearSelectionAndActive = (e: React.MouseEvent) =>
    {
        const actionToken = `clear-active-and-selection:${new Date().getTime()}`
        dispatch(geometriesSetSelectedNodes({
            geometryId, selection: [],
            undo: { actionToken },
        }));
        // dispatch(geometriesSetActiveNode({
        //     geometryId, nodeId: null,
        //     undo: { actionToken },
        // }));
        e.stopPropagation();
    }

    return (
        <BackgroundDiv
            ref={wrapperRef}
            onWheel={onWheel}
            camera={panelState?.camera || DEFAULT_PLANAR_CAMERA}
            onClick={clearSelectionAndActive}
            {...panHandlers}
            {...dragJointHandler}
        >
            <TransformingDiv>
            {
                geometryId && 
                <GeometryEditorContent 
                    panelId={panelId}
                    geometryId={geometryId}
                    getCamera={getCamera}
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

export default GeometryEditorTransform;