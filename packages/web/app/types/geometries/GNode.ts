import { Point } from "../UtilityTypes";
import { RowS, SpecificRowT } from "./Rows";

export enum GNodeTemplateTypes
{
    Recursive,
    Default,
}

export enum GNodeTemplateTags
{
    Output = 'output',
}

export enum GNodeTemplateCategories
{
    Solids = 'solids',
    SolidOperators = 'solid-operators',
    Numbers = 'numbers',
    Vectors = 'vectors',
    Input = 'input',
    Output = 'output',
    Generative = 'generative',
    Math = 'math',
}

export interface GNodeT
{
    id: string;
    type: GNodeTemplateTypes;
    rows: Array<SpecificRowT>;
    tags?: GNodeTemplateTags[];
    category: GNodeTemplateCategories;
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

// export type GNodeZ = 
//     & Pick<GNodeS, 'id' | 'templateId' | 'position'>
//     & Pick<GNodeT, 'type' | 'instructionTemplates' | 'tags'>
//     & { rows: RowZ[] }