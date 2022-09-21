import createFullScreenQuad from "../../utils/gl/createFullscreenQuad";
import { UniformTypes } from "../../utils/gl/setUniform";

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