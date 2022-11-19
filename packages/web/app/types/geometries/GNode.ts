import { ProgramOperationOptions } from "../sceneProgram";
import { Point } from "../UtilityTypes";
import { RowS, SpecificRowT, RowZ, RowT } from "./Rows";

export enum GNodeTypes
{
    Recursive,
    Default,
}

export enum GNodeTags
{
    Output = 'output',
}

export interface GNodeT
{
    id: string;
    type: GNodeTypes;
    rows: Array<SpecificRowT>;
    tags?: GNodeTags[];
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
    & Pick<GNodeT, 'type' | 'instructionTemplates' | 'tags'>
    & { rows: RowZ[] }