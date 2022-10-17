import { GeometryEditorPanelState, GeometryS, GLSLSnippet, GNodeT, SceneProgram } from ".";
import { ViewportPanelState } from "./viewport/ViewportPanel";
import { ObjMap } from "./utils";

export type GeometriesSliceState = ObjMap<GeometryS>;

export type SceneProgramSliceState = 
{
    program: SceneProgram | null;
    textureVarLookupData: number[];
}

export type TemplatesSliceState = 
{
    templates: ObjMap<GNodeT>;
    glslSnippets: ObjMap<GLSLSnippet>;
}