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
    SolidOperators = 'solid_operators',
    Numbers = 'numbers',
    Vectors = 'vectors',
    Input = 'input',
    Output = 'output',
    Generative = 'generative',
    Math = 'math',
}

export const TEMPLATE_CATEGORY_NAMES: { [C in GNodeTemplateCategories]: string } =
{
    [GNodeTemplateCategories.Solids]: 'Solids',
    [GNodeTemplateCategories.SolidOperators]: 'Solid Operators',
    [GNodeTemplateCategories.Numbers]: 'Numbers',
    [GNodeTemplateCategories.Vectors]: 'Vectors',
    [GNodeTemplateCategories.Input]: 'Input',
    [GNodeTemplateCategories.Output]: 'Output',
    [GNodeTemplateCategories.Generative]: 'Generative',
    [GNodeTemplateCategories.Math]: 'Math',
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
    tags?: GNodeTemplateTags[];
    rows: {
        [ rowId: string ]: RowS;
    }
}
