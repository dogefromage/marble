import { Point, Override } from "../utils";
import { RowT, RowS, RowZ } from "./Rows";

export enum GNodeActions
{
    Arithmetic,
    Call,
    Output,
}

export interface GNodeBaseOperation {}

export interface GNodeArithmeticOperation extends GNodeBaseOperation
{
    type: GNodeActions.Arithmetic;
}

export interface GNodeCallOperation extends GNodeBaseOperation
{
    type: GNodeActions.Call;
}

export interface GNodeSpecialOperation extends GNodeBaseOperation
{
    type: GNodeActions.Output;
}

export type GNodeOperation = 
    | GNodeArithmeticOperation
    | GNodeCallOperation
    | GNodeSpecialOperation

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
    operation: GNodeOperation;
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
