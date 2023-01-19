import { IDependency } from "../dependencyGraph";
import { Point } from "../UtilityTypes";
import { RowS, SpecificRowT } from "./Rows";

export enum GNodeTemplateTypes
{
    Base = 'def',
    Composite = 'comp',
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

export interface GNodeT extends IDependency
{
    type: GNodeTemplateTypes;
    rows: Array<SpecificRowT>;
    category: GNodeTemplateCategories;
    instructions: string;
}

export interface GNodeS
{
    id: string;
    templateId: string;
    templateData: null | { version: number, type: GNodeTemplateTypes }
    position: Point;
    rows: {
        [ rowId: string ]: RowS | undefined;
    }
}
