import { GNodeT, GNodeTemplateTypes, GNodeTemplateCategories, RowTypes, DataTypes, DefaultFunctionArgNames } from "../../types";
import { glsl } from "../../utils/codeGeneration/glslTag";
import { TemplateColors } from "./templateConstants";

const input_vector_3x1: GNodeT =
{
    id: 'vector_3x1',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Input,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: '3x1 Vector',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Vec3,
            name: 'Combined Vector',
        },
        {
            id: 'x',
            type: RowTypes.Field,
            name: 'X',
            dataType: DataTypes.Float,
            value: 0,
        },
        {
            id: 'y',
            type: RowTypes.Field,
            name: 'Y',
            dataType: DataTypes.Float,
            value: 0,
        },
        {
            id: 'z',
            type: RowTypes.Field,
            name: 'Z',
            dataType: DataTypes.Float,
            value: 0,
        },
    ],
    instructionTemplates: glsl`
        vec3 $output = vec3($x, $y, $z);
    `,
}

const input_vector_2x1: GNodeT =
{
    id: 'vector_2x1',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Input,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: '2x1 Vector',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Vec2,
            name: 'Combined Vector',
        },
        {
            id: 'x',
            type: RowTypes.Field,
            name: 'X',
            dataType: DataTypes.Float,
            value: 0,
        },
        {
            id: 'y',
            type: RowTypes.Field,
            name: 'Y',
            dataType: DataTypes.Float,
            value: 0,
        },
    ],
    instructionTemplates: glsl`
        vec2 $output = vec2($x, $y);
    `,
}

const input_number: GNodeT =
{
    id: 'number',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Input,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Number',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'Vector',
        },
        {
            id: 'input',
            type: RowTypes.Field,
            name: 'Input',
            dataType: DataTypes.Float,
            value: 0,
        },
    ],
    instructionTemplates: glsl`
        float $output = $input;
    `,
}

export default [
    input_vector_3x1,
    input_vector_2x1,
    input_number,
];