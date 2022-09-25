import { mat4 } from 'gl-matrix';
import { useEffect, useState } from 'react';
import { ViewportQuadProgram } from '../classes/ViewportQuadProgram';
import { useAppSelector } from '../redux/hooks';
import { selectViewportPanels } from '../slices/panelViewportSlice';
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
    const [ program, setProgram ] = useState<ViewportQuadProgram>();

    const viewportPanelState = useAppSelector(selectViewportPanels)[panelId];

    useEffect(() =>
    {
        const _program = new ViewportQuadProgram(gl,
        [
            {
                name: 'inverseCamera',
                type: UniformTypes.UniformMatrix4fv,
                data: Array.from(mat4.create()),
            },
        ]);

        setProgram(_program);
    }, [ gl ]);

    useEffect(() =>
    {
        if (!program) return;

        const worldToScreen = createCameraWorldToScreen(viewportPanelState.camera, canvasAspect);
        const screenToWorld = mat4.invert(mat4.create(), worldToScreen);
        program.setUniformData('inverseCamera', Array.from(screenToWorld));

        requestAnimationFrame(() => program.render());

    }, [ program, viewportPanelState.camera, canvasAspect ]);

    return null;
}

export default ViewportGLProgram;