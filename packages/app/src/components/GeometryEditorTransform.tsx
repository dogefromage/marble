import { useDroppable, useMouseDrag } from '@marble/interactive';
import { vec2 } from 'gl-matrix';
import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesSetUserSelection, selectSingleGeometry } from '../slices/geometriesSlice';
import { selectSingleGeometryData } from '../slices/geometryDatasSlice';
import { CAMERA_MAX_ZOOM, CAMERA_MIN_ZOOM, geometryEditorPanelsSetNewLink, geometryEditorPanelsUpdateCamera } from '../slices/panelGeometryEditorSlice';
import { DEFAULT_NODE_WIDTH } from '../styles/GeometryNodeDiv';
import { GNODE_ROW_UNIT_HEIGHT } from '../styles/GeometryRowDiv';
import MouseSelectionDiv from '../styles/MouseSelectionDiv';
import { Rect, JointLinkDndTransfer, JOINT_LINK_DND_TAG, PlanarCamera, Point, ViewTypes } from '../types';
import { pointScreenToWorld, vectorScreenToWorld } from '../utils/geometries/planarCameraMath';
import { clamp } from '../utils/math';
import { TEST_USER_ID } from '../utils/testSetup';
import GeometryEditorContent from './GeometryEditorContent';

const defaultPlanarCamera: PlanarCamera = {
    position: { x: 0, y: 0 },
    zoom: 1,
}

interface DivProps {
    camera: PlanarCamera;
}

const BackgroundDiv = styled.div.attrs<DivProps>(({ camera }) => {
    const translate = vec2.fromValues(-camera.position.x, -camera.position.y);
    const gridSize = 40 * camera.zoom;
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
    background-color: ${({ theme }) => theme.colors.geometryEditor.background};
    background-position: var(--bg-pos-x) var(--bg-pos-y);
    background-size: var(--grid-size) var(--grid-size);
    --grid-color: ${({ theme }) => theme.colors.geometryEditor.backgroundDots};
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
    geometryId: string;
    panelId: string;
}

const GeometryEditorTransform = ({ geometryId, panelId }: Props) => {
    const dispatch = useAppDispatch();
    const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));
    const geometry = useAppSelector(selectSingleGeometry(geometryId));
    const geometryData = useAppSelector(selectSingleGeometryData(geometryId));
    const cameraRef = useRef(panelState?.camera);
    cameraRef.current = panelState?.camera;
    const getCamera = useCallback(() => cameraRef.current, [cameraRef]);
    const userSelection = geometry?.selections[TEST_USER_ID];
    const wrapperRef = useRef<HTMLDivElement>(null);

    const getOffsetPoint = (e: React.MouseEvent) => {
        if (!wrapperRef.current) return;
        const bounds = wrapperRef.current.getBoundingClientRect();
        return {
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
        };
    }

    const selectionRef = useRef<{ startPoint: Point }>();
    const [ selection, setSelection ] = useState<Rect>();
    const panRef = useRef<{ lastMouse: Point, lastCamera: PlanarCamera }>();
    const isActionOngoingRef = useRef(false);

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
                if (!selection || !panelState?.camera || 
                    !geometry || !geometryData || 
                    geometry.version !== geometryData.geometryVersion) return;
                
                const screenPos = vec2.fromValues(selection.x, selection.y);
                const screenSize = vec2.fromValues(selection.w, selection.h);
                const [ s_x1, s_y1 ] = pointScreenToWorld(panelState.camera, screenPos);
                const [ selectionWidth, selectionHeight ] = vectorScreenToWorld(panelState.camera, screenSize);
                const s_x2 = s_x1 + selectionWidth;
                const s_y2 = s_y1 + selectionHeight;

                const selectedIds: string[] = [];

                for (let i = 0; i < geometry.nodes.length; i++) {
                    const node = geometry.nodes[i];
                    const { x: n_x1, y: n_y1 } = node.position;
                    const nodeData = geometryData.nodeDatas[i];
                    const widthPixels = nodeData?.widthPixels ?? DEFAULT_NODE_WIDTH;
                    const heightUnits = nodeData?.rowHeights.at(-1) ?? 1;
                    const heightPixels = heightUnits * GNODE_ROW_UNIT_HEIGHT;
                    const n_x2 = n_x1 + widthPixels;
                    const n_y2 = n_y1 + heightPixels;

                    // https://silentmatt.com/rectangle-intersection/
                    const nodeIntersectsSelection = 
                        s_x1 < n_x2 && s_x2 > n_x1 &&
                        s_y1 < n_y2 && s_y2 > n_y1;

                    if (nodeIntersectsSelection) {
                        selectedIds.push(node.id);
                    }
                }

                dispatch(geometriesSetUserSelection({
                    geometryId,
                    userId: TEST_USER_ID,
                    selection: selectedIds,
                    undo: { desc: `Selected ${selectedIds.length} nodes in active geometry.` },
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
                isActionOngoingRef.current = true;
            },
            end: e => { isActionOngoingRef.current = false; }
        },
    ]);

    const onWheel = (e: React.WheelEvent) => {
        if (!panelState || isActionOngoingRef.current) return;
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
        const newCamera: PlanarCamera = {
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

    const { handlers: dragJointHandler } = useDroppable<JointLinkDndTransfer>({
        tag: JOINT_LINK_DND_TAG,
        enter: prevDefault,
        leave: prevDefault,
        over(e, transfer) {
            if (wrapperRef.current == null)
                return;

            const time = new Date().getTime();
            if (lastCallTime.current < time - 20) {
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

    const clearSelectionAndActive = (e: React.MouseEvent) => {
        if (userSelection?.length) {
            dispatch(geometriesSetUserSelection({
                geometryId,
                userId: TEST_USER_ID,
                selection: [],
                undo: { desc: `Cleared selection in active geometry.` },
            }));
        }
    }

    return (
        <BackgroundDiv
            ref={wrapperRef}
            onWheel={onWheel}
            camera={panelState?.camera || defaultPlanarCamera}
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