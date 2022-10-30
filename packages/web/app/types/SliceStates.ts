import { ActiveContextMenu, ActivePanel, Command, GeometryS, ProgramInclude, GNodeT, SceneProgram } from ".";
import { ObjMap } from "./UtilityTypes";

export type GeometriesSliceState = ObjMap<GeometryS>;

export type SceneProgramSliceState = 
{
    program: SceneProgram | null;
    textureVarLookupData: number[];
}

export type TemplatesSliceState = 
{
    templates: ObjMap<GNodeT>;
    glslSnippets: ObjMap<ProgramInclude>;
}

export interface CommandsSliceState
{
    commands: ObjMap<Command>;
}

export interface PanelManagerSliceState
{
    activePanel?: ActivePanel;
}

export interface ContextMenuSliceState 
{
    active: ActiveContextMenu | null;
}