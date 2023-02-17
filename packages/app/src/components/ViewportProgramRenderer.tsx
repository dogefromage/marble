import { mat4 } from 'gl-matrix';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { FRAG_CODE_TEMPLATE, VERT_CODE_TEMPLATE } from '../content/shaderTemplates';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import useReactiveMap from '../hooks/useReactiveMap';
import useTrigger from '../hooks/useTrigger';
import { useAppSelector } from '../redux/hooks';
import { selectLayerPrograms } from '../slices/layerProgramsSlice';
import { LayerProgram, ViewTypes } from '../types';
import { CodeTemplate } from '../utils/codeStrings';
import { logCodeWithLines } from '../utils/debugging';
import { createCameraWorldToScreen, viewportCameraToNormalCamera } from '../utils/viewportView/cameraMath';
import { GLProgram } from '../utils/viewportView/GLProgram';
import GLProgramRenderer from '../utils/viewportView/GLProgramRenderer';

function generateShaders(sceneProgram: LayerProgram) {
    const fragCodeTemplate = new CodeTemplate(FRAG_CODE_TEMPLATE);

    const includedCodeTotal = sceneProgram.includes
        .map(i => i.source)
        .join('\n');
    fragCodeTemplate.replace('%INCLUDES%', includedCodeTotal);
    fragCodeTemplate.replace('%MAIN_PROGRAM%', sceneProgram.mainProgramCode);
    fragCodeTemplate.replace('%ROOT_FUNCTION_NAME%', sceneProgram.rootFunctionName);

    const fragCode = fragCodeTemplate.getFinishedCode(/%.*%/);
    // console.log(logCodeWithLines(fragCode));

    return {
        vertCode: VERT_CODE_TEMPLATE,
        fragCode,
    };
}

type GLProgramWrapper = {
    id: string;
    index: number;
    hash: number;
    program: GLProgram;
    textureVarRowIndex: number;
    textureVarRow: number[];
}

const programToGlProgramCurry = (gl: WebGL2RenderingContext) =>
    (layerProgram: LayerProgram): GLProgramWrapper => {
        const shaders = generateShaders(layerProgram);
        const glProgram = new GLProgram(gl, layerProgram.id, shaders.vertCode, shaders.fragCode);
        return {
            id: layerProgram.id,
            index: layerProgram.index,
            hash: layerProgram.hash,
            program: glProgram,
            textureVarRowIndex: layerProgram.textureVarRowIndex,
            textureVarRow: layerProgram.textureVarRow
        }
    }


interface Props {
    gl: WebGL2RenderingContext;
    size: DOMRectReadOnly;
    panelId: string;
}

const ViewportProgramRenderer = ({ gl, size, panelId }: Props) => {
    const [ renderer, setRenderer ] = useState<GLProgramRenderer>();
    const layerPrograms = useAppSelector(selectLayerPrograms);
    const viewportPanelState = useAppSelector(selectPanelState(ViewTypes.Viewport, panelId));
    const [ renderTrigger, triggerRender ] = useTrigger();

    useEffect(() => {
        setRenderer(new GLProgramRenderer(gl));
    }, [ gl ]);

    const programToGLProgram = useMemo(() =>
        programToGlProgramCurry(gl), [ gl ]);

    const glPrograms = useReactiveMap({
        reference: layerPrograms,
        map: programToGLProgram,
        hasChanged: (program, glProgram) => program.hash !== glProgram.hash,
        onDestroy: (glProgram) => glProgram.program.destroy(),
    });

    useLayoutEffect(() => {
        if (!renderer) return;
        for (const layer of Object.values(layerPrograms) as LayerProgram[]) {
            renderer.setVarTextureRow(layer.textureVarRowIndex, layer.textureVarRow);
        }
        triggerRender();
    }, [ renderer, layerPrograms ]);
 
    useEffect(() => {
        for (const program of Object.values(glPrograms) as GLProgramWrapper[]) {
            program.program.onReady = triggerRender;
            renderer?.setVarTextureRow(program.textureVarRowIndex, program.textureVarRow);
        }
    }, [ glPrograms, triggerRender ]);

    useEffect(() => {
        if (!renderer) return;
        const orderedGLPrograms = (Object.values(glPrograms) as GLProgramWrapper[])
            .sort((a, b) => a.index - b.index) // may have to change this order
            .map(wrapper => wrapper.program);
        renderer.requestRender(orderedGLPrograms);
    }, [ renderTrigger ]);

    useEffect(() => {
        if (!renderer || !viewportPanelState) return;

        const targetDistance = viewportPanelState.uniformSources.viewportCamera.distance;
        // invSize
        const invScreenSize = [ 1.0 / size.width, 1.0 / size.height ];
        renderer.setUniformData('invScreenSize', invScreenSize);
        // camera
        const aspect = size.width / size.height;
        const camera = viewportCameraToNormalCamera(viewportPanelState.uniformSources.viewportCamera);
        const worldToScreen = createCameraWorldToScreen(camera, aspect, targetDistance);
        const screenToWorld = mat4.invert(mat4.create(), worldToScreen);
        renderer.setUniformData('inverseCamera', Array.from(screenToWorld));
        // marchParams
        const maxMarchDist = 1e4 * targetDistance;
        const maxMarchIter = viewportPanelState.uniformSources.maxIterations;
        const marchEpsilon = 1e-6 * targetDistance;
        renderer.setUniformData('marchParameters', [ maxMarchDist, maxMarchIter, marchEpsilon ]);
        triggerRender();
    }, [ renderer, viewportPanelState?.uniformSources, size ]);

    return null;
}

export default ViewportProgramRenderer;
