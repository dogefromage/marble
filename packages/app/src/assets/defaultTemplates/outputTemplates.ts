import { DataTypes, GNodeT, GNodeTemplateCategories, GNodeTemplateTags, GNodeTemplateTypes, RowTypes } from "../../types";
import { glsl } from "../../utils/codeGeneration/glslTag";
import { TemplateColors, TEMPLATE_FAR_AWAY } from "./templateConstants";

const output_output: GNodeT =
{
    id: 'output',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Output,
    tags: [ GNodeTemplateTags.Output ],
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
    instructionTemplates: glsl`
        return $input;
    `,
}

export default [
    output_output
];