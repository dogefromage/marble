import { GNodeTemplate, NameRowT, NodeTemplateId, OutputRowT } from "../../types";
import { glsl } from "../../utils/codeStrings";
import { TemplateColors, TEMPLATE_FAR_AWAY } from "./templateConstants";

export const rootOutputTemplateId = 'root:output' satisfies NodeTemplateId;

export const outputNameRow: NameRowT = {
    id: 'name',
    type: 'name',
    name: 'Output',
    color: TemplateColors.Output,
};

const root_output: GNodeTemplate = {
    id: rootOutputTemplateId,
    version: 0,
    category: 'output',
    rows: [
        outputNameRow, 
        {
            id: 'input',
            name: 'Solid',
            type: 'input',
            dataType: 'Solid',
            value: [ TEMPLATE_FAR_AWAY, 0, 0, 0 ],
        },
    ],
    instructions: glsl`
        return input;
    `,
}

export default [
    root_output
];