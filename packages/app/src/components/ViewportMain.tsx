import { useMouseDrag } from '@marble/interactive';
import useResizeObserver from '@react-hook/resize-observer';
import { vec2, vec3 } from 'gl-matrix';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { viewportPanelEditCamera } from '../slices/panelViewportSlice';
import { Size, ViewportCamera, ViewTypes } from '../types';
import { getViewportDirection } from '../utils/viewportView/cameraMath';
import ViewportCanvas from './ViewportCanvas';

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

interface Props {
    panelId: string;
}

const ViewportMain = ({ panelId }: Props) => {
    const dispatch = useAppDispatch();
    const viewportPanelState = useAppSelector(selectPanelState(ViewTypes.Viewport, panelId));
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<Size>();

    useEffect(() => {
        let _size = wrapperRef.current!.getBoundingClientRect();
        setSize({
            w: _size.width,
            h: _size.height,
        });
    }, []);

    useResizeObserver(wrapperRef, div =>
        setSize({
            w: div.contentRect.width,
            h: div.contentRect.height,
        })
    );

    enum CameraDragModes {
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
        start: e => {
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
        move: e => {
            if (!dragRef.current) return;

            const deltaX = e.clientX - dragRef.current.dragStart.x;
            const deltaY = e.clientY - dragRef.current.dragStart.y;

            if (dragRef.current.mode === CameraDragModes.Orbit) {
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
            else {
                if (!size) return;

                const lastCam = dragRef.current.lastCamera;

                const { cameraRotation, cameraDir } = getViewportDirection(lastCam);

                const factor = 1.0 / (2 * size.h); // somehow this is just about right

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

    const onWheel: React.WheelEventHandler = e => {
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
            onWheel={onWheel}> {
                size &&
                <ViewportCanvas panelId={panelId} size={size} />
            }
            {divCatcher}
        </CanvasWrapperDiv>
    );
}

export default ViewportMain;