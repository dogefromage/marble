import { Command, ConsoleMessage, ContextMenuState, DependencyGraph, GeometryConnectionData, GeometryS, GNodeTemplate, Layer, LayerProgram, MenuState, ProgramInclude, World } from ".";
import { ObjMapUndef, Rect } from "./UtilityTypes";

export type GeometriesSliceState = ObjMapUndef<GeometryS>;
export type GeometryDatasSliceState = ObjMapUndef<GeometryConnectionData>;
export type LayerProgramsSliceState = ObjMapUndef<LayerProgram>;
export type MenusSliceState = ObjMapUndef<MenuState>;
export type LayersSliceState = ObjMapUndef<Layer>;
export type DependencyGraphSliceState = DependencyGraph;
export type WorldSliceState = World;

export type PreferencesSliceState = {};

export interface CommandsSliceState { commands: ObjMapUndef<Command> };

export type TemplatesSliceState = {
    templates: ObjMapUndef<GNodeTemplate>;
    includes: ObjMapUndef<ProgramInclude>;
}

export interface PanelManagerSliceState {
    activePanelId: string;
    rootClientRect: Rect;
    clientRects: Map<string, Rect>;
}

export type ContextMenuSliceState = { contextMenu: ContextMenuState | null };

export type ConsoleSliceState = {
    feed: ConsoleMessage[];
}