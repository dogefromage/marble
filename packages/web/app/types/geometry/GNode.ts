import { ArithmeticOperations, DataTypes, ProgramOperationTypes } from "../sceneProgram";
import { Point, Override } from "../utils";
import { RowT, RowS, RowZ } from "./Rows";

export interface GNodeBaseOperation {}

export interface GNodeArithmeticOperation extends GNodeBaseOperation
{
    type: ProgramOperationTypes.Arithmetic;
    lhsRowId: string;
    rhsRowId: string;
    outputRowId: string;
    outputDatatype: DataTypes;
    operation: ArithmeticOperations;
}

export interface GNodeCallOperation extends GNodeBaseOperation
{
    type: ProgramOperationTypes.Call;
    argumentRowIds: string[],
    functionName: string,
    outputRowId: string;
    outputDatatype: DataTypes,
}

export interface GNodeSpecialOperation extends GNodeBaseOperation
{
    type: ProgramOperationTypes.Output;
    inputRowId: string;
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
    glslSnippedIds: string[];
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
