import { DataTypes, GNodeT, GNodeTemplateCategories, GNodeTemplateTags, GNodeTemplateTypes, RowTypes } from "../../types";
import { glsl } from "../../utils/codeStrings";
import { TemplateColors, TEMPLATE_FAR_AWAY } from "./templateConstants";

export const OUTPUT_TEMPLATE_ID = 'output';

const output_output: GNodeT =
{
    id: OUTPUT_TEMPLATE_ID,
    version: 0,
    type: GNodeTemplateTypes.Base,
    category: GNodeTemplateCategories.Output,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Output',
            color: TemplateColors.Output,
        },
        {
            id: 'input',
            name: 'Solid',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Solid,
            value: [ TEMPLATE_FAR_AWAY, 0, 0, 0 ],
        },
    ],
    instructions: glsl`
        return input;
    `,
}

export default [
    output_output
];