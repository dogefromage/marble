import { CommandParameterMap } from "../command";
import { Point } from "../UtilityTypes";

export interface ActiveContextMenu
{
    panelId: string;
    name: string;
    position: Point;
    commandIds: string[];
    paramMap: CommandParameterMap;
}