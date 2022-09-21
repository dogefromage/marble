import { Point, Override } from "../utils";
import { RowT, RowS, RowZ } from "./Rows";

export enum GNodeActions
{
    Operation,
    Call,
}

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
