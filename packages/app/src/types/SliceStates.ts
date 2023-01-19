import { ActivePanel, Command, ContextMenuState, GeometryS, GNodeT, ProgramInclude, LayerProgram, DependencyGraph, GeometryConnectionData } from ".";
import { ConsoleMessage } from "./console";
import { Layer } from "./layer";
import { ObjMapUndef } from "./UtilityTypes";
import { World } from "./world";

export type GeometriesSliceState = ObjMapUndef<GeometryS>;
export type GeometryDatasSliceState = ObjMapUndef<GeometryConnectionData>;

export type ProgramsSliceState = ObjMapUndef<LayerProgram>;

export type TemplatesSliceState = {
    templates: ObjMapUndef<GNodeT>;
    includes: ObjMapUndef<ProgramInclude>;
}

export interface CommandsSliceState { commands: ObjMapUndef<Command> };

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

export type LayersSliceState = ObjMapUndef<Layer>;

export type DependencyGraphSliceState = DependencyGraph;
