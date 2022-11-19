import { GNodeT, GNodeTemplateTypes, RowTypes, DataTypes, GNodeTemplateCategories } from "../../types"
import { glsl } from "../../utils/codeGeneration/glslTag"
import { TemplateColors, TEMPLATE_FAR_AWAY, TEMPLATE_FAR_AWAY_FORMAT } from "./templateConstants"

const solid_operation_union: GNodeT =
{
    id: 'union',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.SolidOperators,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Union',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'Union',
        },
        {
            id: 'inputs',
            type: RowTypes.InputStacked,
            name: 'Solid',
            dataType: DataTypes.Float,
            value: TEMPLATE_FAR_AWAY,
        },
    ],
    instructionTemplates: glsl`
        #INCLUDE inc_union;
        float $output = #STACK(inc_union, $inputs, ${TEMPLATE_FAR_AWAY_FORMAT});
    `,
}

const solid_operation_difference: GNodeT =
{
    id: 'difference',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.SolidOperators,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Difference',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'Difference',
        },
        {
            id: 'positive',
            type: RowTypes.InputOnly,
            name: 'Start Solid',
            dataType: DataTypes.Float,
            value: TEMPLATE_FAR_AWAY,
        },
        {
            id: 'negatives',
            type: RowTypes.InputStacked,
            name: 'Complement',
            dataType: DataTypes.Float,
            value: TEMPLATE_FAR_AWAY,
        },
    ],
    instructionTemplates: glsl`
        #INCLUDE inc_union;
        float $neg = #STACK(inc_union, $negatives, ${TEMPLATE_FAR_AWAY_FORMAT});
        float $output = max($positive, -$neg);
    `,
}

const solid_operation_intersection: GNodeT =
{
    id: 'intersection',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.SolidOperators,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Intersection',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'Intersection',
        },
        {
            id: 'inputs',
            type: RowTypes.InputStacked,
            name: 'Solid',
            dataType: DataTypes.Float,
            value: TEMPLATE_FAR_AWAY,
        },
    ],
    instructionTemplates: glsl`
        #INCLUDE inc_intersection;
        float $output = #STACK(inc_intersection, $inputs, ${TEMPLATE_FAR_AWAY_FORMAT});
    `,
}

export default [
    solid_operation_union,
    solid_operation_difference,
    solid_operation_intersection,
];