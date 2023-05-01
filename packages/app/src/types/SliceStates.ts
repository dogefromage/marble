import * as ML from "@marble/language";
import { Command, ContextMenuState, Layer, LayerProgram, MenuState, World } from ".";
import { Obj, Rect } from "./UtilityTypes";

export type FlowsSliceState = Obj<ML.FlowGraph>;
export type LayerProgramsSliceState = Obj<LayerProgram>;
export type MenusSliceState = Obj<MenuState>;
export type LayersSliceState = Obj<Layer>;
export type WorldSliceState = World;

export type PreferencesSliceState = {};

export interface CommandsSliceState { commands: Obj<Command> };



export interface AppSliceState {
    hasUserSaved: boolean;
    projectToLoad?: {
        data: string | null;
    };
}

export interface ContextSliceState {
    projectContext: ML.ProjectContext | null;
    // add cache
}

export interface PanelManagerSliceState {
    activePanelId: string;
    rootClientRect: Rect;
    clientRects: Map<string, Rect>;
}

export type ContextMenuSliceState = { contextMenu: ContextMenuState | null };