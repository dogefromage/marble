import { defaultDataTypeValue, getTemplateId, GNodeTemplate } from "../../types"
import { defaultInputRows } from "../../types/geometries/defaultRows"
import { glsl } from "../../utils/codeStrings"
import { inputField, inputRow, nameRow, outputRow } from "./rowShorthands"
import { EMPTY_SOLID_LITERAL, TemplateColors } from "./templateConstants"

const union: GNodeTemplate = {
    id: getTemplateId('static', 'union'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Union', TemplateColors.SolidOperations),
        outputRow('output', 'Union', 'Solid'),
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

const difference: GNodeTemplate = {
    id: getTemplateId('static', 'difference'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Difference', TemplateColors.SolidOperations),
        outputRow('output', 'Difference', 'Solid'),
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

const intersection: GNodeTemplate = {
    id: getTemplateId('static', 'intersection'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Intersection', TemplateColors.SolidOperations),
        outputRow('output', 'Intersection', 'Solid'),
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

const smooth_union: GNodeTemplate = {
    id: getTemplateId('static', 'smooth_union'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Smooth Union', TemplateColors.SolidOperations),
        outputRow('output', 'Smooth Union', 'Solid'),
        inputRow('a', 'Solid A', 'Solid'),
        inputRow('b', 'Solid B', 'Solid'),
        inputField('k', 'Smoothness', 'float'),
    ],
    instructions: glsl`
        #INCLUDE inc_smooth_union;
        Solid output = inc_smooth_union(a, b, k);
    `,
}

const smooth_difference: GNodeTemplate = {
    id: getTemplateId('static', 'smooth_difference'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Smooth Difference', TemplateColors.SolidOperations),
        outputRow('output', 'Smooth Difference', 'Solid'),
        inputRow('a', 'Solid A', 'Solid'),
        inputRow('b', 'Solid B', 'Solid'),
        inputField('k', 'Smoothness', 'float'),
    ],
    instructions: glsl`
        #INCLUDE inc_smooth_difference;
        Solid output = inc_smooth_difference(a, b, k);
    `,
}

const smooth_intersection: GNodeTemplate = {
    id: getTemplateId('static', 'smooth_intersection'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Smooth Intersection', TemplateColors.SolidOperations),
        outputRow('output', 'Smooth Intersection', 'Solid'),
        inputRow('a', 'Solid A', 'Solid'),
        inputRow('b', 'Solid B', 'Solid'),
        inputField('k', 'Smoothness', 'float'),
    ],
    instructions: glsl`
        #INCLUDE inc_smooth_intersection;
        Solid output = inc_smooth_intersection(a, b, k);
    `,
}

const round_corners: GNodeTemplate = {
    id: getTemplateId('static', 'round_corners'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Round Corners', TemplateColors.SolidOperations),
        outputRow('output', 'Rounded Solid', 'Solid'),
        inputRow('solid', 'Solid', 'Solid'),
        inputField('radius', 'Radius', 'float', 0),
    ],
    instructions: glsl`
        Solid output = Solid(solid.sd - radius, solid.color);
    `,
}

const onion: GNodeTemplate = {
    id: getTemplateId('static', 'onion'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Onion', TemplateColors.SolidOperations),
        outputRow('output', 'Onioned Solid', 'Solid'),
        inputRow('solid', 'Solid', 'Solid'),
        inputField('thickness', 'Thickness', 'float', 0.1),
    ],
    instructions: glsl`
        Solid output = Solid(abs(solid.sd) - thickness, solid.color);
    `,
}

const extrude_z: GNodeTemplate = {
    id: getTemplateId('static', 'extrude_z'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Extrude on z-Axis', TemplateColors.SolidOperations),
        outputRow('output', 'Extrusion', 'Solid'),
        defaultInputRows['position'],
        inputRow('solid', 'xy-Solid', 'Solid'),
        inputField('height', 'Height', 'float', 1),
    ],
    instructions: glsl`
        #INCLUDE inc_extrude_z;
        Solid output = inc_extrude_z(position, solid, height);
    `,
}

const set_color: GNodeTemplate = {
    id: getTemplateId('static', 'set_color'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Set Color', TemplateColors.SolidOperations),
        outputRow('output', 'Smooth Union', 'Solid'),
        inputRow('input', 'Solid', 'Solid'),
        inputRow('color', 'Color', 'vec3'),
    ],
    instructions: glsl`
        Solid output = Solid(input.sd, color);
    `,
}

const operation_correct_distance: GNodeTemplate =
{
    id: getTemplateId('static', 'reduce_step_size'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Correct Distance', TemplateColors.SolidOperations),
        outputRow('output', 'Smooth Union', 'Solid'),
        inputRow('input', 'Solid', 'Solid'),
        inputField('factor', 'Factor', 'float', 1),
    ],
    instructions: glsl`
        Solid output = Solid(factor * input.sd, input.color);
    `,
}

export default [
    union, difference, intersection,
    smooth_union, smooth_difference, smooth_intersection,

    round_corners, onion,
    extrude_z,
    
    set_color, operation_correct_distance,
];