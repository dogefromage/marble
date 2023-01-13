import { ActivePanel, Command, ContextMenuState, GeometryS, GNodeT, ProgramInclude, RenderLayerProgram } from ".";
import { ConsoleMessage } from "./console";
import { ObjMapUndef } from "./UtilityTypes";
import { World } from "./world";

export type GeometriesSliceState = ObjMapUndef<GeometryS>;
export type ProgramsSliceState = ObjMapUndef<RenderLayerProgram>;

export type TemplatesSliceState = {
    templates: ObjMapUndef<GNodeT>;
    includes: ObjMapUndef<ProgramInclude>;
}

export interface CommandsSliceState {
    commands: ObjMapUndef<Command>;
}

export interface PanelManagerSliceState {
    activePanel?: ActivePanel;
}

export interface ContextMenuSliceState {
    active: ContextMenuState | null;
}

export type PreferencesSliceState = {};

export type WorldSliceState = World;

export type ConsoleSliceState = {
    feed: ConsoleMessage[];
}