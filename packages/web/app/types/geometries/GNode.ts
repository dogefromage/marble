import { ProgramOperationOptions } from "../sceneProgram";
import { Override, Point } from "../UtilityTypes";
import { RowS, RowT, RowZ } from "./Rows";

export enum GNodeTypes
{
    Recursive,
    Default,
}

export interface GNodeT
{
    id: string;
    type: GNodeTypes;
    rows: Array<RowT>;
    operationOptions: ProgramOperationOptions;
    includeIds: string[];
}

export interface GNodeS
{
    id: string;
    templateId: string;
    position: Point;
    rows: {
        [ rowId: string ]: RowS;
    }
}

export type GNodeZ = Override<GNodeS & GNodeT, 'rows',  Array<RowZ>>;
