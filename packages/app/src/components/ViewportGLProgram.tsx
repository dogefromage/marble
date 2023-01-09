import { mat4 } from 'gl-matrix';
import { useEffect, useState } from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppSelector } from '../redux/hooks';
import { selectSceneProgram } from '../slices/sceneProgramSlice';
import { ViewTypes } from '../types';
import { generateGLSL } from '../utils/codeGeneration/generateGLSL';
import { degToRad } from '../utils/math';
import { createCameraWorldToScreen, viewportCameraToNormalCamera } from '../utils/viewport/cameraMath';
import { UniformTypes } from '../utils/viewport/setUniform';
import { ViewportQuadProgram } from '../utils/viewport/ViewportQuadProgram';

interface Props
{
    gl: WebGL2RenderingContext;
    size: DOMRectReadOnly;
    panelId: string;
}

const ViewportGLProgram = ({ gl, size, panelId }: Props) =>
{
    const [ quadProgram, setQuadProgram ] = useState<ViewportQuadProgram>();
    const sceneProgramState = useAppSelector(selectSceneProgram);
    const viewportPanelState = useAppSelector(selectPanelState(ViewTypes.Viewport, panelId));

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
                data: [ 0.03, 0.03, 0.07 ],
            },
            'sunColor': {
                type: UniformTypes.Uniform3fv,
                data: [ 1, 0.9, 0.7 ],
            },
            'sunGeometry': {
                type: UniformTypes.Uniform4fv,
                data: [ 0.312347, 0.15617376, 0.93704257, degToRad(3) ],
            },
        });
        setQuadProgram(_program);
    }, [ gl ]);

    // /**
    //  * Generate and set program
    //  */
    // useEffect(() =>
    // {
    //     if (!sceneProgramState.program ||
    //         !quadProgram) return;
    //     const shaders = generateGLSL(sceneProgramState.program);
    //     quadProgram.loadProgram(shaders.vertCode, shaders.fragCode);
    //     quadProgram.requestRender();
    // }, [ sceneProgramState.program, quadProgram ]);

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
        const maxMarchDist = 1e4 * targetDistance;
        const maxMarchIter = viewportPanelState.uniformSources.maxIterations;
        const marchEpsilon = 1e-6 * targetDistance;
        quadProgram.setUniformData('marchParameters', [ maxMarchDist, maxMarchIter, marchEpsilon ]);

        quadProgram.requestRender();
    }, [ quadProgram, viewportPanelState?.uniformSources, size ]);

    return null;
}

export default ViewportGLProgram;
