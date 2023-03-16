import { useMouseDrag } from '@marble/interactive';
import useResizeObserver from '@react-hook/resize-observer';
import { vec2, vec3 } from 'gl-matrix';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { viewportPanelEditCamera } from '../slices/panelViewportSlice';
import { Point, Size, ViewportCamera, ViewTypes } from '../types';
import { getViewportDirection } from '../utils/viewportView/cameraMath';
import ViewportCanvas from './ViewportCanvas';

const CanvasWrapperDiv = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    canvas {
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
        let { width, height } = wrapperRef.current!.getBoundingClientRect();
        setSize({ w: width, h: height, });
    }, []);
    useResizeObserver(wrapperRef, div =>
        setSize({
            w: div.contentRect.width,
            h: div.contentRect.height,
        })
    );

    enum DragMode {
        Orbit, Pan, Zoom,
    }
    const dragRef = useRef<{
        mode: DragMode;
        mouseStart: vec2;
    }>();

    const lastCameraRef = useRef<ViewportCamera>();

    const zoomCamera = (scrollUnits: number) => {
        const lastCamera = lastCameraRef.current!;
        const zoomFactor = Math.pow(1.1, scrollUnits / 100);
        dispatch(viewportPanelEditCamera({
            panelId,
            partialCamera: {
                distance: lastCamera.distance * zoomFactor,
            }
        }));
    }

    const handleGestureStart = (clientPos: vec2, shiftKey: boolean, ctrlKey: boolean) => {
        if (!viewportPanelState) return;
        const mode =
            shiftKey ? DragMode.Pan :
                ctrlKey ? DragMode.Zoom :
                    DragMode.Orbit;

        lastCameraRef.current = viewportPanelState.uniformSources.viewportCamera;
        dragRef.current = {
            mode: mode,
            mouseStart: clientPos,
        }
    }

    const handleGestureMove = (mouseNew: vec2) => {
        if (!dragRef.current) return;

        if (dragRef.current.mode === DragMode.Orbit) {
            const cameraSensitivity = vec2.fromValues(-0.8, -0.8);
            const { mouseStart } = dragRef.current!;
            const lastCamera = lastCameraRef.current!;
            const delta = vec2.sub(vec2.create(), mouseNew, mouseStart);
            const deltaRot = vec2.fromValues(delta[1] * cameraSensitivity[1], delta[0] * cameraSensitivity[0]);
            const rotation = vec2.add(vec2.create(), lastCamera.rotation, deltaRot);
            dispatch(viewportPanelEditCamera({
                panelId,
                partialCamera: { rotation }
            }));

        } else if (dragRef.current.mode === DragMode.Pan) {
            if (!size) return;
            const { mouseStart } = dragRef.current!;
            const lastCamera = lastCameraRef.current!;
            const delta = vec2.sub(vec2.create(), mouseNew, mouseStart);
            const { cameraRotation } = getViewportDirection(lastCamera);
            // somehow this is just about right, no idea why
            const panFactor = 1.0 / (2 * size.h);
            const windowPan = vec3.fromValues(-panFactor * delta[0], panFactor * delta[1], 0);
            const worldPan = vec3.transformQuat(vec3.create(), windowPan, cameraRotation);
            vec3.scale(worldPan, worldPan, lastCamera.distance);
            const newTarget = vec3.add(vec3.create(), lastCamera.target, worldPan);
            dispatch(viewportPanelEditCamera({
                panelId,
                partialCamera: { target: newTarget },
            }));

        } else if (dragRef.current.mode === DragMode.Zoom) {
            const { mouseStart } = dragRef.current;
            const dragDelta = mouseNew[1] - mouseStart[1];
            const dragZoomSensitivity = -5.;
            zoomCamera(dragDelta * dragZoomSensitivity);

        }
    }

    const { catcher: divCatcher, handlers: divHandlers } = useMouseDrag({
        mouseButton: 1,
        start: e => {
            handleGestureStart(
                vec2.fromValues(e.clientX, e.clientY),
                e.shiftKey, e.ctrlKey
            );
        },
        move: e => {
            handleGestureMove(vec2.fromValues(e.clientX, e.clientY));
        },
    });
    const onWheel: React.WheelEventHandler = e => {
        if (!viewportPanelState) return;
        lastCameraRef.current = viewportPanelState.uniformSources.viewportCamera;
        zoomCamera(e.deltaY);
    }

    const touchStart: React.TouchEventHandler = e => {
        if (!viewportPanelState || e.touches.length !== 1) return;
        const touch = e.touches[0];
        handleGestureStart(
            vec2.fromValues(touch.clientX, touch.clientY),
            e.shiftKey, e.ctrlKey
        );
    }
    const touchMove: React.TouchEventHandler = e => {
        if (!dragRef.current || e.touches.length !== 1) return;
        const touch = e.touches[0];
        handleGestureMove(vec2.fromValues(touch.clientX, touch.clientY));
    }
    // const touchEnd: React.TouchEventHandler = e => {
    //     e.stopPropagation();
    // }

    return (
        <CanvasWrapperDiv
            ref={wrapperRef}
            {...divHandlers}
            onWheel={onWheel}
            onTouchStart={touchStart}
            onTouchMove={touchMove}
            // onTouchCancel={touchEnd}
            // onTouchEnd={touchEnd}
        > {
                size &&
                <ViewportCanvas panelId={panelId} size={size} />
            }
            {divCatcher}
        </CanvasWrapperDiv>
    );
}

export default ViewportMain;