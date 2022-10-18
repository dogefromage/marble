import { mat4 } from 'gl-matrix';
import { useEffect, useState } from 'react';
import { ViewportQuadProgram } from '../classes/ViewportQuadProgram';
import useEffectTrigger from '../hooks/useEffectTrigger';
import { useAppSelector } from '../redux/hooks';
import { selectViewportPanels } from '../slices/panelViewportSlice';
import { selectSceneProgram } from '../slices/sceneProgramSlice';
import { generateGLSL } from '../utils/codeGeneration/generateGLSL';
import { degToRad } from '../utils/math';
import { usePanelState } from '../utils/panelState/usePanelState';
import { createCameraWorldToScreen, viewportCameraToNormalCamera } from '../utils/viewport/cameraMath';
import { UniformTypes } from '../utils/viewport/setUniform';

interface Props
{
    gl: WebGL2RenderingContext;
    size: DOMRectReadOnly;
    panelId: string;
}

const ViewportGLProgram = ({ gl, size, panelId }: Props) =>
{
    const [ quadProgram, setQuadProgram ] = useState<ViewportQuadProgram>();
    const viewportPanelState = usePanelState(selectViewportPanels, panelId);
    const sceneProgramState = useAppSelector(selectSceneProgram);

    /**
     * Create class instance
     */
    useEffect(() =>
    {
        const _program = new ViewportQuadProgram(gl,
        {
            'inverseCamera': {
                type: UniformTypes.UniformMatrix4fv,
                data: Array.from(mat4.create()),
            },
            'invScreenSize': {
                type: UniformTypes.Uniform2fv,
                data: [ 0, 0 ],
            },
            'marchParameters': {
                type: UniformTypes.Uniform3fv,
                data: [ 100, 0, 0.001 ], // has no effect only default
            },
            'ambientColor': {
                type: UniformTypes.Uniform3fv,
                data: [ 0.2, 0.2, 0.2 ],
            },
            'ambientOcclusion': {
                type: UniformTypes.Uniform2fv,
                data: [ 50, 5 ],
            },
            'sunColor': {
                type: UniformTypes.Uniform3fv,
                data: [ 1, 1, 1 ],
            },
            'sunGeometry': {
                type: UniformTypes.Uniform4fv,
                data: [ 0.312347, 0.15617376, 0.93704257, degToRad(3) ],
            },
        });
        setQuadProgram(_program);
    }, [ gl ]);

    /**
     * Generate and set program
     */
    useEffect(() =>
    {
        if (!sceneProgramState.program ||
            !quadProgram) return;
        const shaders = generateGLSL(sceneProgramState.program);
        quadProgram.loadProgram(shaders.vertCode, shaders.fragCode);
        quadProgram.requestRender();
    }, [ sceneProgramState.program, quadProgram ]);

    /**
     * Update texture data for variables
     */
    useEffect(() =>
    {
        if (!quadProgram) return;
        quadProgram.setVarTextureData(sceneProgramState.textureVarLookupData);
        quadProgram.requestRender();
    }, [ sceneProgramState.textureVarLookupData, quadProgram ])

    /**
     * Update uniforms
     */
    useEffect(() =>
    {
        if (!quadProgram || !viewportPanelState) return;

        const targetDistance = viewportPanelState.uniformSources.viewportCamera.distance;

        // invSize
        const invScreenSize = [ 1.0 / size.width, 1.0 / size.height ];
        quadProgram.setUniformData('invScreenSize', invScreenSize);

        // camera
        const aspect = size.width / size.height;
        const camera = viewportCameraToNormalCamera(viewportPanelState.uniformSources.viewportCamera);
        const worldToScreen = createCameraWorldToScreen(camera, aspect, targetDistance);
        const screenToWorld = mat4.invert(mat4.create(), worldToScreen);
        quadProgram.setUniformData('inverseCamera', Array.from(screenToWorld));

        // marchParams
        const maxMarchDist = 1e3 * targetDistance;
        const maxMarchIter = viewportPanelState.uniformSources.maxIterations;
        const marchEpsilon = 1e-5 * targetDistance;
        quadProgram.setUniformData('marchParameters', [ maxMarchDist, maxMarchIter, marchEpsilon ]);

        quadProgram.requestRender();
    }, [ quadProgram, viewportPanelState?.uniformSources, size ]);

    return null;
}

export default ViewportGLProgram;
