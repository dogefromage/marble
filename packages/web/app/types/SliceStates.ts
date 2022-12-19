import { ContextMenuState, ActivePanel, Command, GeometryS, GNodeT, ProgramInclude, SceneProgram } from ".";
import { ConsoleMessage } from "./console";
import { ObjMap } from "./UtilityTypes";
import { World } from "./world";

export type GeometriesSliceState = ObjMap<GeometryS>;

export type SceneProgramSliceState = 
{
    program: SceneProgram | null;
    textureVarLookupData: number[];
}

export type TemplatesSliceState = 
{
    templates: ObjMap<GNodeT>;
    programIncludes: ObjMap<ProgramInclude>;
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
    active: ContextMenuState | null;
}

export type PreferencesSliceState = {};

export type WorldSliceState = World;

export type ConsoleSliceState = {
    feed: ConsoleMessage[];
}