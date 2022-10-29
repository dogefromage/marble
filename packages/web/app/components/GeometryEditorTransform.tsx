import { useMouseDrag } from '@marble/interactive';
import { vec2 } from 'gl-matrix';
import { useRef } from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '../redux/hooks';
import { CAMERA_MAX_ZOOM, CAMERA_MIN_ZOOM, geometryEditorPanelsEditCamera, geometryEditorSetActiveNode, selectGeometryEditorPanels } from '../slices/panelGeometryEditorSlice';
import { DEFAULT_PLANAR_CAMERA, PlanarCamera, Point, ViewProps } from '../types';
import { vectorScreenToWorld } from '../utils/geometries/planarCameraMath';
import { clamp } from '../utils/math';
import { usePanelState } from '../utils/panelState/usePanelState';
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
    viewProps: ViewProps;
}

const GeometryEditorTransform = ({ geometryId, viewProps }: Props) =>
{
    const dispatch = useAppDispatch();
    const panelState = usePanelState(selectGeometryEditorPanels, viewProps.panelId);

    const wrapperRef = useRef<HTMLDivElement>(null);

    const panRef = useRef<{
        lastMouse: Point;
        lastCamera: PlanarCamera;
    }>();

    const actionOngoingRef = useRef(false);

    const { handlers, catcher } = useMouseDrag({
        mouseButton: 1,
        start: e =>
        {
            if (!panelState || actionOngoingRef.current) return;

            panRef.current = {
                lastMouse: {
                    x: e.clientX,
                    y: e.clientY,
                },
                lastCamera: panelState.camera,
            }

            actionOngoingRef.current = true;

        },
        move: e =>
        {
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

            dispatch(geometryEditorPanelsEditCamera({
                panelId: viewProps.panelId,
                partialCamera: { position }
            }))

            e.preventDefault();
        },
        end: e =>
        {
            actionOngoingRef.current = false;
        }
    })

    const onWheel = (e: React.WheelEvent) =>
    {
        if (!wrapperRef.current || !panelState || actionOngoingRef.current) return;

        const zoomFactor = 1.1;
        const k = Math.pow(zoomFactor, -e.deltaY / 100);

        const bounds = wrapperRef.current.getBoundingClientRect();
        const ps = 
        {
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
        };

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

        dispatch(geometryEditorPanelsEditCamera({
            panelId: viewProps.panelId,
            partialCamera: newCamera,
        }));
    };

    return (
        <BackgroundDiv
            ref={wrapperRef}
            onWheel={onWheel}
            camera={panelState?.camera || DEFAULT_PLANAR_CAMERA}
            onClick={() =>
            {
                dispatch(geometryEditorSetActiveNode({
                    panelId: viewProps.panelId,
                }))
            }}
            {...handlers}
        >
            <TransformingDiv>
            {
                geometryId && 
                <GeometryEditorContent 
                    viewProps={viewProps}
                    geometryId={geometryId}
                />
            }
            </TransformingDiv>
            { catcher }
        </BackgroundDiv>
    );
}

export default GeometryEditorTransform;