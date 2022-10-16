import { mat4 } from 'gl-matrix';
import { useEffect, useState } from 'react';
import { ViewportQuadProgram } from '../classes/ViewportQuadProgram';
import useEffectTrigger from '../hooks/useEffectTrigger';
import { useAppSelector } from '../redux/hooks';
import { selectViewportPanels } from '../slices/panelViewportSlice';
import { selectSceneProgram } from '../slices/sceneProgramSlice';
import { generateGLSL } from '../utils/codeGeneration/generateGLSL';
import { createCameraWorldToScreen } from '../utils/viewport/matrixMath';
import { UniformTypes } from '../utils/viewport/setUniform';

interface Props
{
    gl: WebGL2RenderingContext;
    canvasAspect: number;
    panelId: string;
}

const ViewportGLProgram = ({ gl, canvasAspect, panelId }: Props) =>
{
    const [ quadProgram, setQuadProgram ] = useState<ViewportQuadProgram>();
    const viewportPanelState = useAppSelector(selectViewportPanels)[panelId];
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
        quadProgram.setProgram(shaders.vertCode, shaders.fragCode);
    }, [ sceneProgramState.program, quadProgram ]);

    /**
     * Update texture data for variables
     */
    useEffect(() =>
    {
        if (!quadProgram) return;
        quadProgram.setVarTextureData(sceneProgramState.textureVarLookupData);
        quadProgram.render();
    }, [ sceneProgramState.textureVarLookupData, quadProgram ])

    /**
     * Update uniforms
     */
    useEffect(() =>
    {
        if (!quadProgram) return;
        const worldToScreen = createCameraWorldToScreen(viewportPanelState.camera, canvasAspect);
        const screenToWorld = mat4.invert(mat4.create(), worldToScreen);
        quadProgram.setUniformData('inverseCamera', Array.from(screenToWorld));
        quadProgram.render();
    }, [ quadProgram, viewportPanelState.camera, canvasAspect ]);

    return null;
}

export default ViewportGLProgram;
