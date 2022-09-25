import createFullScreenQuad from "../../utils/viewport/createFullscreenQuad";
import { UniformTypes } from "../../utils/viewport/setUniform";

export interface GLFullScreenQuadInstance
{
    gl: WebGL2RenderingContext;
    setAttribPointerToQuad: ReturnType<typeof createFullScreenQuad>;
} 

export type GLProgramUniforms = Array<{
    name: string;
    type: UniformTypes; 
    data: number[];
}>

export interface ProgramUniform
{
    name: string;
    type: UniformTypes;
    data: number[];
}