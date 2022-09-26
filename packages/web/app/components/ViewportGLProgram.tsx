import { mat4 } from 'gl-matrix';
import { useEffect, useState } from 'react';
import { ViewportQuadProgram } from '../classes/ViewportQuadProgram';
import { useAppSelector } from '../redux/hooks';
import { selectViewportPanels } from '../slices/panelViewportSlice';
import { selectSceneProgram } from '../slices/sceneProgramSlice';
import { generateGLSL } from '../utils/codeGeneration/generateGLSL';
import { glsl } from '../utils/codeGeneration/glslTag';
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

    useEffect(() =>
    {
        if (!quadProgram) return;

        const worldToScreen = createCameraWorldToScreen(viewportPanelState.camera, canvasAspect);
        const screenToWorld = mat4.invert(mat4.create(), worldToScreen);
        quadProgram.setUniformData('inverseCamera', Array.from(screenToWorld));

        requestAnimationFrame(() => quadProgram.render());

    }, [ quadProgram, viewportPanelState.camera, canvasAspect ]);

    useEffect(() =>
    {
        if (!sceneProgramState.program ||
            !quadProgram) return;

        const shaders = generateGLSL(sceneProgramState.program);

        // console.log(`\n\n\n\nVERT SHADER\n\n`);
        // console.log(shaders.vertCode);
        // console.log(`\n\nFRAG SHADER\n\n`);
        // console.log(shaders.fragCode);

        quadProgram.setProgram(shaders.vertCode, shaders.fragCode);

    }, [ sceneProgramState.program, quadProgram ]);

    return null;
}

export default ViewportGLProgram;
