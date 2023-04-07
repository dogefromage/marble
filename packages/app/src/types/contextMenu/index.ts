import { CommandParameterMap, Vec2 } from "..";

export interface ContextMenuState {
    panelId: string;
    name: string;
    position: Vec2;
    commandIds: string[];
    paramMap: CommandParameterMap;
}