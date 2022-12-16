import { CommandParameterMap } from "../command";
import { Point } from "../UtilityTypes";

export interface ContextMenuState
{
    panelId: string;
    name: string;
    position: Point;
    commandIds: string[];
    paramMap: CommandParameterMap;
}