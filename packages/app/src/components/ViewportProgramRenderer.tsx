import { mat4 } from 'gl-matrix';
import { useEffect, useLayoutEffect, useState } from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import useTrigger from '../hooks/useTrigger';
import { useAppSelector } from '../redux/hooks';
import { selectLayerPrograms } from '../slices/layerProgramsSlice';
import { Size, ViewTypes } from '../types';
import { createCameraWorldToScreen, viewportCameraToNormalCamera } from '../utils/viewportView/cameraMath';
import { globalViewportUniforms } from '../utils/viewportView/uniforms';
import { ViewportPipeline } from '../utils/viewportView/ViewportPipeline';

interface Props {
    gl: WebGL2RenderingContext;
    size: Size;
    panelId: string;
}

const ViewportProgramRenderer = ({ gl, size, panelId }: Props) => {
    const [pipeline, setPipeline] = useState<ViewportPipeline>();
    const layerPrograms = useAppSelector(selectLayerPrograms);
    const viewportPanelState = useAppSelector(selectPanelState(ViewTypes.Viewport, panelId));
    const [renderTrigger, triggerRender] = useTrigger();

    useEffect(() => {
        setPipeline(new ViewportPipeline(gl))
    }, [gl]);

    useLayoutEffect(() => {
        if (!pipeline) return;
        // create delete programs
        pipeline.updateLayerPrograms(layerPrograms);
        // update textureVarRows
        triggerRender();
    }, [pipeline, layerPrograms]);

    useEffect(() => {
        if (!pipeline || !viewportPanelState) return;

        const targetDistance = viewportPanelState.uniformSources.viewportCamera.distance;
        const cameraNear = 0.01 * targetDistance;
        const cameraFar = 100 * targetDistance;
    
        
        // invSize
        const invScreenSize = [1.0 / size.w, 1.0 / size.h];
        pipeline.setGlobalUniformData('invScreenSize', invScreenSize);
        // camera
        const aspect = size.w / size.h;
        const camera = viewportCameraToNormalCamera(viewportPanelState.uniformSources.viewportCamera);
        const worldToScreen = createCameraWorldToScreen(camera, aspect, cameraNear, cameraFar);
        const screenToWorld = mat4.invert(mat4.create(), worldToScreen);
        pipeline.setGlobalUniformData(
            globalViewportUniforms.inverseCamera.name, 
            Array.from(screenToWorld),
        );
        pipeline.setGlobalUniformData(
            globalViewportUniforms.cameraTarget.name, 
            Array.from(viewportPanelState.uniformSources.viewportCamera.target)
        );
        pipeline.setGlobalUniformData(
            globalViewportUniforms.cameraDistance.name, 
            [ viewportPanelState.uniformSources.viewportCamera.distance ]
        );
        // console.log(camera.direction);
        pipeline.setGlobalUniformData(
            globalViewportUniforms.cameraDirection.name, Array.from(camera.direction));
        pipeline.setGlobalUniformData(
            globalViewportUniforms.cameraNear.name, [ cameraNear ]);
        pipeline.setGlobalUniformData(
            globalViewportUniforms.cameraFar.name, [ cameraFar ],);
        // marchParams
        const maxMarchDist = 1e4 * targetDistance;
        const maxMarchIter = viewportPanelState.uniformSources.maxIterations;
        const marchEpsilon = 1e-6 * targetDistance;
        pipeline.setGlobalUniformData('marchParameters', [maxMarchDist, maxMarchIter, marchEpsilon]);

        triggerRender();
    }, [pipeline, viewportPanelState?.uniformSources, size]);

    useEffect(() => {
        pipeline?.requestRender();
    }, [renderTrigger]);

    return null;
}

export default ViewportProgramRenderer;
