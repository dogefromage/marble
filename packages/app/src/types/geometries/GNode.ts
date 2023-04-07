
// export type GNodeTemplateCategory = 
//     | 'solids'
//     | 'solid_operators'
//     | 'numbers'
//     | 'vectors'
//     | 'input'
//     | 'output'
//     | 'generative'
//     | 'math'
//     | 'composite'

// export const templateCategoryNames: { [ C in GNodeTemplateCategory ]: string } = {
//     'solids':          'Solids',
//     'solid_operators': 'Solid Operators',
//     'numbers':         'Numbers',
//     'vectors':         'Vectors',
//     'input':           'Input',
//     'output':          'Output',
//     'generative':      'Generative',
//     'math':            'Math',
//     'composite':       'Composite',
// };

// export type GNodeTemplateTypes = 'static' | 'composite' | 'output' | 'input';

// export function getTemplateId(templateType: GNodeTemplateTypes, identifier: string) {
//     return `${templateType}:${identifier}` as const;
// }
// export type NodeTemplateId = ReturnType<typeof getTemplateId>;
// export function decomposeTemplateId(templateId: NodeTemplateId) {
//     const [ type, id ] = splitFirst(templateId, ':') as [ GNodeTemplateTypes, string ];
//     return { type, id  };
// }

// type TemplateInstructions = FunctionNode;

// export interface GNodeTemplate extends Dependable {
//     id: NodeTemplateId;
//     rows: Array<SpecificRowT>;
//     category: GNodeTemplateCategory;
//     instructions: string;
// }

// export interface GNodeState {
//     id: string;
//     templateId: NodeTemplateId;
//     templateVersion: number;
//     position: Point;
//     rows: {
//         [ rowId: string ]: RowS | undefined;
//     }
// }
