import { mat4 } from 'gl-matrix';
import { useEffect, useState } from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppSelector } from '../redux/hooks';
import { selectPrograms } from '../slices/programsSlice';
import { ViewTypes } from '../types';
import { generateShaders } from '../utils/codeGeneration/generateShaders';
import { createCameraWorldToScreen, viewportCameraToNormalCamera } from '../utils/viewport/cameraMath';
import { GLProgram } from '../utils/viewport/GLProgram';
import GLProgramRenderer from '../utils/viewport/GLProgramRenderer';

interface Props
{
    gl: WebGL2RenderingContext;
    size: DOMRectReadOnly;
    panelId: string;
}

const ViewportProgramRenderer = ({ gl, size, panelId }: Props) =>
{
    const [ quadProgram, setQuadProgram ] = useState<GLProgramRenderer>();
    const programLayers = useAppSelector(selectPrograms);
    const viewportPanelState = useAppSelector(selectPanelState(ViewTypes.Viewport, panelId));

    const layerZero = Object.values(programLayers)?.[0];

    /**
     * Create class instance
     */
    useEffect(() =>
    {
        const _program = new GLProgramRenderer(gl);
        setQuadProgram(_program);
    }, [ gl ]);

    /**
     * Generate and set program
     */
    useEffect(() =>
    { 
        if (!layerZero ||
            !quadProgram) return;
        const shaders = generateShaders(layerZero);
        quadProgram.loadProgram(shaders.vertCode, shaders.fragCode);
        quadProgram.requestRender();
    }, [ layerZero, quadProgram ]);

    /**
     * Update texture data for variables
     */
    useEffect(() =>
    {
        if (!quadProgram || !layerZero) return;
        quadProgram.setVarTextureData(layerZero.textureVarLookupData);
        quadProgram.requestRender();
    }, [ layerZero?.textureVarLookupData, quadProgram ])

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

export default ViewportProgramRenderer;
