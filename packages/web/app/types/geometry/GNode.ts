import { Point, Override } from "../utils";
import { RowT, RowS, RowZ } from "./Rows";

export enum GNodeActions
{
    Operation,
    Call,
    Output,
}

export interface GNodeBaseAction {}

export interface GNodeOperationAction extends GNodeBaseAction
{
    actionType: GNodeActions.Operation;
}

export interface GNodeCallAction extends GNodeBaseAction
{
    actionType: GNodeActions.Call;
}

export interface GNodeSpecialAction extends GNodeBaseAction
{
    actionType: GNodeActions.Output;
}

export type GNodeAction = 
    | GNodeOperationAction
    | GNodeCallAction
    | GNodeSpecialAction

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
    action: GNodeAction;
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
