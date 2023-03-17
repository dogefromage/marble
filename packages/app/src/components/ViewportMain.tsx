import { useMouseDrag } from '@marble/interactive';
import useResizeObserver from '@react-hook/resize-observer';
import { vec2, vec3 } from 'gl-matrix';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Matrix3, Vector2, Vector3 } from 'three';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { viewportPanelEditCamera } from '../slices/panelViewportSlice';
import { Point, Size, ViewportCamera, ViewTypes } from '../types';
import { degToRad } from '../utils/math';
import { getViewportRotation } from '../utils/viewportView/cameraMath';
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
        mouseStart: Vector2;
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

    const handleGestureStart = (clientPos: Vector2, shiftKey: boolean, ctrlKey: boolean) => {
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

    const handleGestureMove = (mouseNew: Vector2) => {
        if (!dragRef.current) return;

        if (dragRef.current.mode === DragMode.Orbit) {
            const cameraSensitivity = -0.014;
            const { mouseStart } = dragRef.current!;
            const lastCamera = lastCameraRef.current!;
            const mouseDelta = mouseNew.clone().sub(mouseStart);
            const deltaRot = new Vector2(mouseDelta.y * cameraSensitivity, mouseDelta.x * cameraSensitivity)
            const rotation = new Vector2().fromArray(lastCamera.rotation);
            rotation.add(deltaRot);
            dispatch(viewportPanelEditCamera({
                panelId,
                partialCamera: { rotation: rotation.toArray() },
            }));

        } else if (dragRef.current.mode === DragMode.Pan) {
            if (!size) return;
            const { mouseStart } = dragRef.current!;
            const lastCamera = lastCameraRef.current!;
            const mouseDelta = mouseNew.clone().sub(mouseStart);
            const rotation = getViewportRotation(lastCamera);
            // somehow this is just about right, no idea why
            const fovFactor = Math.tan(degToRad(lastCamera.fov));
            const panFactor = fovFactor / (size.h);
            const windowPan = new Vector3(-panFactor * mouseDelta.x, panFactor * mouseDelta.y, 0);
            const worldPan = windowPan.clone()
                .applyQuaternion(rotation)
                .multiplyScalar(lastCamera.distance);
            const target = new Vector3()
                .fromArray(lastCamera.target)
                .add(worldPan);    
            dispatch(viewportPanelEditCamera({
                panelId,
                partialCamera: { target: target.toArray() },
            }));

        } else if (dragRef.current.mode === DragMode.Zoom) {
            const { mouseStart } = dragRef.current;
            const dragDelta = mouseNew.y - mouseStart.y;
            const dragZoomSensitivity = -5.;
            zoomCamera(dragDelta * dragZoomSensitivity);

        }
    }

    const { catcher: divCatcher, handlers: divHandlers } = useMouseDrag({
        mouseButton: 1,
        start: e => {
            handleGestureStart(
                new Vector2(e.clientX, e.clientY),
                e.shiftKey, e.ctrlKey
            );
        },
        move: e => {
            handleGestureMove(
                new Vector2(e.clientX, e.clientY),
            );
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
            new Vector2(touch.clientX, touch.clientY),
            e.shiftKey, e.ctrlKey
        );
    }
    const touchMove: React.TouchEventHandler = e => {
        if (!dragRef.current || e.touches.length !== 1) return;
        const touch = e.touches[0];
        handleGestureMove(
            new Vector2(touch.clientX, touch.clientY),
        );
    }

    return (
        <CanvasWrapperDiv
            ref={wrapperRef}
            {...divHandlers}
            onWheel={onWheel}
            onTouchStart={touchStart}
            onTouchMove={touchMove}
        > {
                size &&
                <ViewportCanvas panelId={panelId} size={size} />
            }
            {divCatcher}
        </CanvasWrapperDiv>
    );
}

export default ViewportMain;