import { CommandParameterMap, Point } from "..";

export interface ContextMenuState {
    panelId: string;
    name: string;
    position: Point;
    commandIds: string[];
    paramMap: CommandParameterMap;
}