import { Point } from "../UtilityTypes";
import { RowS, SpecificRowT } from "./Rows";

export enum GNodeTemplateTypes
{
    Base = 'base',
    Composite = 'composite',
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
    Composite = 'composite',
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
    [GNodeTemplateCategories.Composite]: 'Composite',
}

export interface GNodeT
{
    id: string;
    type: GNodeTemplateTypes;
    rows: Array<SpecificRowT>;
    tags?: GNodeTemplateTags[];
    category: GNodeTemplateCategories;
    // one of both
    sourceGeometry?: string;
    instructionTemplates?: string;
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
