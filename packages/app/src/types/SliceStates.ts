import { FlowGraph } from "@marble/language";
import { Command, ConsoleMessage, ContextMenuState, DependencyGraph, Layer, LayerProgram, MenuState, World } from ".";
import { Obj, Rect } from "./UtilityTypes";

export type FlowsSliceState = Obj<FlowGraph | undefined>;
// export type GeometryDatasSliceState = Obj<GeometryConnectionData>;
export type LayerProgramsSliceState = Obj<LayerProgram>;
export type MenusSliceState = Obj<MenuState>;
export type LayersSliceState = Obj<Layer>;
export type DependencyGraphSliceState = DependencyGraph;
export type WorldSliceState = World;

export type PreferencesSliceState = {};

export interface CommandsSliceState { commands: Obj<Command> };

// export type TemplatesSliceState = {
//     templates: Obj<GNodeTemplate>;
//     includes: Obj<ProgramInclude>;
// }

export interface PanelManagerSliceState {
    activePanelId: string;
    rootClientRect: Rect;
    clientRects: Map<string, Rect>;
}

export type ContextMenuSliceState = { contextMenu: ContextMenuState | null };

export type ConsoleSliceState = {
    feed: ConsoleMessage[];
}