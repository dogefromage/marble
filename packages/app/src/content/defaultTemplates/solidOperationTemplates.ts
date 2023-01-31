import { defaultDataTypeValue, getTemplateId, GNodeTemplate } from "../../types"
import { glsl } from "../../utils/codeStrings"
import { EMPTY_SOLID_LITERAL, TemplateColors } from "./templateConstants"

const solid_operation_union: GNodeTemplate =
{
    id: getTemplateId('union', 'static'),
    version: 0,
    category: 'solid_operators',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Union',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'Solid',
            name: 'Union',
        },
        {
            id: 'inputs',
            type: 'input_stacked',
            name: 'Solid',
            dataType: 'Solid',
            value: defaultDataTypeValue['Solid'],
        },
    ],
    instructions: glsl`
        #INCLUDE inc_union;
        Solid output = #REDUCE(inc_union, inputs, ${EMPTY_SOLID_LITERAL});
    `,
}

const solid_operation_difference: GNodeTemplate =
{
    id: getTemplateId('difference', 'static'),
    version: 0,
    category: 'solid_operators',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Difference',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'Solid',
            name: 'Difference',
        },
        {
            id: 'positive',
            type: 'input',
            name: 'Start Solid',
            dataType: 'Solid',
            value: defaultDataTypeValue['Solid'],
        },
        {
            id: 'negatives',
            type: 'input_stacked',
            name: 'Complement',
            dataType: 'Solid',
            value: defaultDataTypeValue['Solid'],
        },
    ],
    instructions: glsl`
        #INCLUDE inc_union, inc_difference;
        Solid neg = #REDUCE(inc_union, negatives, ${EMPTY_SOLID_LITERAL});
        Solid output = inc_difference(positive, neg);
    `,
}

const solid_operation_intersection: GNodeTemplate =
{
    id: getTemplateId('intersection', 'static'),
    version: 0,
    category: 'solid_operators',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Intersection',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'Solid',
            name: 'Intersection',
        },
        {
            id: 'inputs',
            type: 'input_stacked',
            name: 'Solid',
            dataType: 'Solid',
            value: defaultDataTypeValue['Solid'],
        },
    ],
    instructions: glsl`
        #INCLUDE inc_intersection;
        Solid output = #REDUCE(inc_intersection, inputs, ${EMPTY_SOLID_LITERAL});
    `,
}

const solid_operation_set_color: GNodeTemplate =
{
    id: getTemplateId('set_color', 'static'),
    version: 0,
    category: 'solid_operators',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Set Color',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'Solid',
            name: 'Solid',
        },
        {
            id: 'input',
            type: 'input',
            name: 'Solid',
            dataType: 'Solid',
            value: defaultDataTypeValue['Solid'],
        },
        {
            id: 'color',
            type: 'color',
            name: 'Color',
            dataType: 'vec3',
            value: [ 1, 1, 1 ],
        }
    ],
    instructions: glsl`
        Solid output = Solid(input.sd, color);
    `,
}

const solid_operation_correct_distance: GNodeTemplate =
{
    id: getTemplateId('reduce_step_size', 'static'),
    version: 0,
    category: 'solid_operators',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Correct Distance',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'Solid',
            name: 'Solid',
        },
        {
            id: 'input',
            type: 'input',
            name: 'Solid',
            dataType: 'Solid',
            value: defaultDataTypeValue['Solid'],
        },
        {
            id: 'factor',
            type: 'field',
            name: 'Factor',
            dataType: 'float',
            value: 1,
        }
    ],
    instructions: glsl`
        Solid output = Solid(factor * input.sd, input.color);
    `,
}

export default [
    solid_operation_union,
    solid_operation_difference,
    solid_operation_intersection,
    solid_operation_set_color,
    solid_operation_correct_distance,
];