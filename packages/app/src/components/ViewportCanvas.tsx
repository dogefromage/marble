import { useMouseDrag } from '@marble/interactive';
import useResizeObserver from '@react-hook/resize-observer';
import { vec2, vec3 } from 'gl-matrix';
import React from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { viewportPanelEditCamera } from '../slices/panelViewportSlice';
import { ViewportCamera, ViewTypes } from '../types';
import { getViewportDirection } from '../utils/viewportView/cameraMath';
import ViewportProgramRenderer from './ViewportProgramRenderer';

const CanvasWrapperDiv = styled.div`
    
    width: 100%;
    height: 100%;

    position: relative;
    overflow: hidden;

    canvas
    {
        position: absolute;
        top: 0;
        left: 0;
    }
`;

interface Props
{
    panelId: string;
}

const ViewportCanvas = ({ panelId }: Props) =>
{
    const dispatch = useAppDispatch();
    const viewportPanelState = useAppSelector(selectPanelState(ViewTypes.Viewport, panelId));

    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const [ ctx, setCtx  ] = useState<WebGL2RenderingContext>();
    const [ size, setSize ] = useState<DOMRectReadOnly>();

    /**
     * CANVAS 
     */
    useEffect(() => {
        if (!wrapperRef.current || !canvasRef.current) return;
        let _size = size || wrapperRef.current.getBoundingClientRect();
        if (!size) setSize(_size);
        canvasRef.current.width = _size.width;
        canvasRef.current.height = _size.height;
        const _gl = canvasRef.current.getContext('webgl2');
        if (!_gl) {
            throw new Error('WebGL2 is not supported by your browser :(');
        }
        setCtx(_gl);
    }, []);
    
    useResizeObserver(wrapperRef, div => setSize(div.contentRect))

    useLayoutEffect(() => {
        if (!size || !canvasRef.current) return;
        canvasRef.current.width = size.width;
        canvasRef.current.height = size.height;
        if (!ctx) return;
        ctx.viewport(0, 0, size.width, size.height);
    }, [ size ]);

    /**
     * CAMERA
     */
    enum CameraDragModes
    {
        Orbit,
        Pan,
    }

    const dragRef = useRef<{
        dragStart: { x: number, y: number };
        lastCamera: ViewportCamera;
        mode: CameraDragModes;
    }>()

    const { catcher: divCatcher, handlers: divHandlers } = useMouseDrag({
        mouseButton: 1,
        start: e => 
        {
            if (!viewportPanelState) return;

            let mode: CameraDragModes = CameraDragModes.Orbit;
            if (e.shiftKey) mode = CameraDragModes.Pan;
            
            dragRef.current = 
            { 
                dragStart: { x: e.clientX, y: e.clientY },
                lastCamera: viewportPanelState.uniformSources.viewportCamera,
                mode,
            }
        },
        move: e =>
        {
            if (!dragRef.current) return;
    
            const deltaX = e.clientX - dragRef.current.dragStart.x;
            const deltaY = e.clientY - dragRef.current.dragStart.y;

            if (dragRef.current.mode === CameraDragModes.Orbit)
            {
                const verticalSensitivity = -0.8;
                const horizontalSensitivity = -0.8;
    
                const deltaRot = vec2.fromValues(
                    verticalSensitivity * deltaY,
                    horizontalSensitivity * deltaX,
                );
    
                const rotation = vec2.add(vec2.create(), dragRef.current.lastCamera.rotation, deltaRot);
    
                dispatch(viewportPanelEditCamera({
                    panelId, 
                    partialCamera: {
                        rotation,
                    }
                }))
            }
            else
            {
                if (!size) return;

                const lastCam = dragRef.current.lastCamera;
                
                const { cameraRotation, cameraDir } = getViewportDirection(lastCam);

                const factor = 1.0 / (2 * size.height); // somehow this is just about right

                const windowPan = vec3.fromValues(-factor * deltaX, factor * deltaY, 0);
                const worldPan = vec3.transformQuat(vec3.create(), windowPan, cameraRotation);
                vec3.scale(worldPan, worldPan, lastCam.distance);

                const newTarget = vec3.add(vec3.create(), dragRef.current.lastCamera.target, worldPan);

                dispatch(viewportPanelEditCamera({
                    panelId,
                    partialCamera: {
                        target: newTarget,
                    }
                }))
            }
        },
    });

    const onWheel: React.WheelEventHandler = e =>
    {
        if (!viewportPanelState) return;
        
        const zoomMultiplier = 1.1;
        const zoomFactor = Math.pow(zoomMultiplier, e.deltaY / 100);

        const lastDist = viewportPanelState.uniformSources.viewportCamera.distance;

        dispatch(viewportPanelEditCamera({
            panelId,
            partialCamera: {
                distance: lastDist * zoomFactor,
            }
        }))
    }

    return (
        <CanvasWrapperDiv 
            ref={wrapperRef}
            {...divHandlers}
            onWheel={onWheel}
        >
            <canvas
                ref={canvasRef}
            />
            {
                ctx && size && 
                <ViewportProgramRenderer 
                    gl={ctx} 
                    size={size}
                    panelId={panelId}
                />
            }
            { divCatcher }
        </CanvasWrapperDiv>
    );
}

export default ViewportCanvas;