import { FlowGraph, FunctionSignature, TypeSpecifier } from "@marble/language";
import { ProjectContext } from "@marble/language";
import { Command, ConsoleMessage, ContextMenuState, DependencyGraph, Layer, LayerProgram, MenuState, World } from ".";
import { Obj, Rect } from "./UtilityTypes";

export type FlowsSliceState = Obj<FlowGraph>;
// export type GeometryDatasSliceState = Obj<GeometryConnectionData>;
export type LayerProgramsSliceState = Obj<LayerProgram>;
export type MenusSliceState = Obj<MenuState>;
export type LayersSliceState = Obj<Layer>;
export type DependencyGraphSliceState = DependencyGraph;
export type WorldSliceState = World;

export type PreferencesSliceState = {};

export interface CommandsSliceState { commands: Obj<Command> };

export interface AssetsSliceState {
    signatures: Obj<FunctionSignature>;
    types: Obj<TypeSpecifier>;
    glsl: Obj<string>;
}

export interface ContextSliceState {
    projectContext: ProjectContext | null;
    // add cache
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