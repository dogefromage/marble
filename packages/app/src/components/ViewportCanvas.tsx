import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import useTrigger from '../hooks/useTrigger';
import { useAppSelector } from '../redux/hooks';
import { selectLayerPrograms } from '../slices/layerProgramsSlice';
import { Size, ViewTypes } from '../types';
import ViewportScene from '../utils/viewportView/ViewportScene';

interface Props {
    panelId: string;
    size: Size;
}

const ViewportCanvas = ({ panelId, size }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null); const [scene, setScene] = useState<ViewportScene>();
    const layerPrograms = useAppSelector(selectLayerPrograms);
    const viewportPanelState = useAppSelector(selectPanelState(ViewTypes.Viewport, panelId));

    useEffect(() => {
        const canvas = canvasRef.current!;
        setScene(new ViewportScene(canvas));
    }, []);

    useLayoutEffect(() => {
        if (!scene) return;
        scene.syncUserPrograms(layerPrograms);
        scene?.requestRender()
    }, [scene, layerPrograms]);

    useEffect(() => {
        if (!scene || !viewportPanelState) return;
        scene.setSize(size);
        scene.updateViewportUniforms(viewportPanelState);
        scene?.requestRender()
    }, [scene, viewportPanelState, size]);

    return (
        <canvas
            ref={canvasRef}
        />
    );
}

export default ViewportCanvas;