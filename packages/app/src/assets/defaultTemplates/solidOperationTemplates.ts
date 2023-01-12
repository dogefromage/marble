import { GNodeT, GNodeTemplateTypes, RowTypes, DataTypes, GNodeTemplateCategories } from "../../types"
import { glsl } from "../../utils/glslTag"
import { EMPTY_SOLID, EMPTY_SOLID_FORMAT, TemplateColors, TEMPLATE_FAR_AWAY, TEMPLATE_FAR_AWAY_FORMAT } from "./templateConstants"

const solid_operation_union: GNodeT =
{
    id: 'union',
    version: 0,
    type: GNodeTemplateTypes.Base,
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
            dataType: DataTypes.Solid,
            name: 'Union',
        },
        {
            id: 'inputs',
            type: RowTypes.InputStacked,
            name: 'Solid',
            dataType: DataTypes.Solid,
            value: EMPTY_SOLID,
        },
    ],
    instructions: glsl`
        #INCLUDE inc_union;
        Solid $output = #STACK(inc_union, $inputs, ${EMPTY_SOLID_FORMAT});
    `,
}

const solid_operation_difference: GNodeT =
{
    id: 'difference',
    version: 0,
    type: GNodeTemplateTypes.Base,
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
            dataType: DataTypes.Solid,
            name: 'Difference',
        },
        {
            id: 'positive',
            type: RowTypes.InputOnly,
            name: 'Start Solid',
            dataType: DataTypes.Solid,
            value: EMPTY_SOLID,
        },
        {
            id: 'negatives',
            type: RowTypes.InputStacked,
            name: 'Complement',
            dataType: DataTypes.Solid,
            value: EMPTY_SOLID,
        },
    ],
    instructions: glsl`
        #INCLUDE inc_union, inc_difference;
        Solid $neg = #STACK(inc_union, $negatives, ${EMPTY_SOLID_FORMAT});
        Solid $output = inc_difference($positive, $neg);
    `,
}

const solid_operation_intersection: GNodeT =
{
    id: 'intersection',
    version: 0,
    type: GNodeTemplateTypes.Base,
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
            dataType: DataTypes.Solid,
            name: 'Intersection',
        },
        {
            id: 'inputs',
            type: RowTypes.InputStacked,
            name: 'Solid',
            dataType: DataTypes.Solid,
            value: EMPTY_SOLID,
        },
    ],
    instructions: glsl`
        #INCLUDE inc_intersection;
        Solid $output = #STACK(inc_intersection, $inputs, ${EMPTY_SOLID_FORMAT});
    `,
}

const solid_operation_set_color: GNodeT =
{
    id: 'set_color',
    version: 0,
    type: GNodeTemplateTypes.Base,
    category: GNodeTemplateCategories.SolidOperators,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Set Color',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Solid,
            name: 'Solid',
        },
        {
            id: 'input',
            type: RowTypes.InputOnly,
            name: 'Solid',
            dataType: DataTypes.Solid,
            value: EMPTY_SOLID,
        },
        {
            id: 'color',
            type: RowTypes.Field,
            name: 'Color',
            dataType: DataTypes.Vec3,
            value: [ 1, 1, 1 ],
        }
    ],
    instructions: glsl`
        Solid $output = Solid($input.sd, $color);
    `,
}

const solid_operation_correct_distance: GNodeT =
{
    id: 'reduce_step_size',
    version: 0,
    type: GNodeTemplateTypes.Base,
    category: GNodeTemplateCategories.SolidOperators,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Correct Distance',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Solid,
            name: 'Solid',
        },
        {
            id: 'input',
            type: RowTypes.InputOnly,
            name: 'Solid',
            dataType: DataTypes.Solid,
            value: EMPTY_SOLID,
        },
        {
            id: 'factor',
            type: RowTypes.Field,
            name: 'Factor',
            dataType: DataTypes.Float,
            value: 1,
        }
    ],
    instructions: glsl`
        Solid $output = Solid($factor * $input.sd, $input.color);
    `,
}

export default [
    solid_operation_union,
    solid_operation_difference,
    solid_operation_intersection,
    solid_operation_set_color,
    solid_operation_correct_distance,
];