import { GeometryS, GLSLSnippet, GNodeT, SceneProgram } from ".";
import { ViewportPanelState } from "./viewport/PanelViewport";
import { ObjMap } from "./utils";

export type GeometriesSliceState = ObjMap<GeometryS>;

export type ViewportPanelsSliceState = ObjMap<ViewportPanelState>;

export type SceneProgramSliceState = 
{
    program: SceneProgram | null;
}

export type TemplatesSliceState = 
{
    templates: ObjMap<GNodeT>;
    glslSnippets: ObjMap<GLSLSnippet>;
}