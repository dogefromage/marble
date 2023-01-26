import { Dependable } from "../dependencyGraph";
import { Point } from "../UtilityTypes";
import { RowS, SpecificRowT } from "./Rows";

export type GNodeTemplateCategories = 
    | 'solids'
    | 'solid_operators'
    | 'numbers'
    | 'vectors'
    | 'input'
    | 'output'
    | 'generative'
    | 'math'
    | 'composite'

export const templateCategoryNames: { [ C in GNodeTemplateCategories ]: string } = {
    'solids':          'Solids',
    'solid_operators': 'Solid Operators',
    'numbers':         'Numbers',
    'vectors':         'Vectors',
    'input':           'Input',
    'output':          'Output',
    'generative':      'Generative',
    'math':            'Math',
    'composite':       'Composite',
};

export type GNodeTemplateTypes = 'static' | 'composite' | 'output';

export function getTemplateId(identifier: string, templateType: GNodeTemplateTypes) {
    return `${identifier}:${templateType}` as const;
}
export type NodeTemplateId = ReturnType<typeof getTemplateId>;
export function decomposeTemplateId(templateId: NodeTemplateId) {
    const [ identifier, templateType ] = 
        templateId.split(':') as [ string, GNodeTemplateTypes ];
    return { relatedGeometry: identifier, templateType };
}

export interface GNodeTemplate extends Dependable {
    id: NodeTemplateId;
    rows: Array<SpecificRowT>;
    category: GNodeTemplateCategories;
    instructions: string;
}

export interface GNodeState {
    id: string;
    templateId: NodeTemplateId;
    templateVersion: number;
    position: Point;
    rows: {
        [ rowId: string ]: RowS | undefined;
    }
}
