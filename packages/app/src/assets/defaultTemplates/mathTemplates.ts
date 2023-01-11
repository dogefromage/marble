import { DataTypes, GNodeT, GNodeTemplateCategories, GNodeTemplateTypes, RowTypes } from "../../types";
import { glsl } from "../../utils/glslTag";
import { TemplateColors } from "./templateConstants";

const math_product: GNodeT =
{
    id: 'product',
    version: 0,
    type: GNodeTemplateTypes.Base,
    category: GNodeTemplateCategories.Math,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Product',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'Product',
        },
        {
            id: 'input',
            type: RowTypes.InputStacked,
            name: 'X',
            dataType: DataTypes.Float,
            value: 1,
        },
    ],
    instructionTemplates: glsl`
        #INCLUDE inc_multiply;
        float $output = #STACK(inc_multiply, $input, 1.0);
    `,
}

const math_map: GNodeT =
{
    id: 'map',
    version: 0,
    type: GNodeTemplateTypes.Base,
    category: GNodeTemplateCategories.Math,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Map',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'Map',
        },
        {
            id: 'input',
            type: RowTypes.Field,
            name: 'Input',
            dataType: DataTypes.Float,
            value: 0,
        },
        {
            id: 'from_min',
            type: RowTypes.Field,
            name: 'From Min',
            dataType: DataTypes.Float,
            value: 0,
        },
        {
            id: 'from_max',
            type: RowTypes.Field,
            name: 'From Max',
            dataType: DataTypes.Float,
            value: 1,
        },
        {
            id: 'to_min',
            type: RowTypes.Field,
            name: 'To Min',
            dataType: DataTypes.Float,
            value: 0,
        },
        {
            id: 'to_max',
            type: RowTypes.Field,
            name: 'To Max',
            dataType: DataTypes.Float,
            value: 1,
        },
    ],
    instructionTemplates: glsl`
        float $t = ($input - $from_min) / ($from_max - $from_min);
        float $output = $to_min + $t * ($to_max - $to_min);
    `,
}

export default [
    math_product,
    math_map,
];