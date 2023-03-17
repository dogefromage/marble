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
    const [renderWatchable, triggerRender] = useTrigger();

    useEffect(() => {
        const canvas = canvasRef.current!;
        const scene = new ViewportScene(canvas);
        scene.setSize(size);
        setScene(scene);
    }, []);

    useLayoutEffect(() => {
        if (!scene) return;
        scene.syncUserPrograms(layerPrograms);
        triggerRender();
    }, [scene, layerPrograms]);

    useEffect(() => {
        if (!scene || !viewportPanelState) return;

        scene.setSize(size);
        // // invSize
        // const invScreenSize = [1.0 / size.w, 1.0 / size.h];
        // pipeline.setGlobalUniformData('invScreenSize', invScreenSize);

        scene.updateCamera(viewportPanelState.uniformSources.viewportCamera);

        // camera
        // const aspect = size.w / size.h;
        // const camera = viewportCameraToNormalCamera(viewportPanelState.uniformSources.viewportCamera);
        // const worldToScreen = createCameraWorldToScreen(camera, aspect, cameraNear, cameraFar);
        // const screenToWorld = mat4.invert(mat4.create(), worldToScreen);
        // pipeline.setGlobalUniformData(
        //     globalViewportUniforms.inverseCamera.name, 
        //     Array.from(screenToWorld),
        // );
        // pipeline.setGlobalUniformData(
        //     globalViewportUniforms.cameraTarget.name, 
        //     Array.from(viewportPanelState.uniformSources.viewportCamera.target)
        // );
        // pipeline.setGlobalUniformData(
        //     globalViewportUniforms.cameraDistance.name, 
        //     [ viewportPanelState.uniformSources.viewportCamera.distance ]
        // );
        // // console.log(camera.direction);
        // pipeline.setGlobalUniformData(
        //     globalViewportUniforms.cameraDirection.name, Array.from(camera.direction));
        // pipeline.setGlobalUniformData(
        //     globalViewportUniforms.cameraNear.name, [ cameraNear ]);
        // pipeline.setGlobalUniformData(
        //     globalViewportUniforms.cameraFar.name, [ cameraFar ],);
        // // marchParams
        // const maxMarchDist = 1e4 * targetDistance;
        // const maxMarchIter = viewportPanelState.uniformSources.maxIterations;
        // const marchEpsilon = 1e-6 * targetDistance;
        // pipeline.setGlobalUniformData('marchParameters', [maxMarchDist, maxMarchIter, marchEpsilon]);

        triggerRender();
    }, [scene, viewportPanelState?.uniformSources, size]);

    useEffect(() => {
        scene?.requestRender();
    }, [renderWatchable]);

    return (
        <canvas
            ref={canvasRef}
        />
    );
}

export default ViewportCanvas;