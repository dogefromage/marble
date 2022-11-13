import { ProgramOperationOptions } from "../sceneProgram";
import { Point } from "../UtilityTypes";
import { RowS, SpecificRowT, RowZ, RowT } from "./Rows";

export enum GNodeTypes
{
    Recursive,
    Default,
}

export interface GNodeT
{
    id: string;
    type: GNodeTypes;
    rows: Array<SpecificRowT>;
    // operations: ProgramOperationOptions[];
    // includeIds: string[];
    instructionTemplates: string;
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

export type GNodeZ = 
    & Pick<GNodeS, 'id' | 'templateId' | 'position'>
    // & Pick<GNodeT, 'type' | 'operations' | 'includeIds'>
    & Pick<GNodeT, 'type' | 'instructionTemplates'>
    & { rows: RowZ[] }