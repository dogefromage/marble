import { getTemplateId, GNodeTemplate } from "../../types"
import { glsl } from "../../utils/codeStrings"
import { inputField, inputRow, nameRow, outputRow } from "./rowShorthands"
import { templateColors } from "./templateConstants"

const union: GNodeTemplate = {
    id: getTemplateId('static', 'union'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Union', templateColors['solid_operators']),
        outputRow('output', 'Union', 'Surface'),
        inputRow('surf_a', 'Surface A', 'Surface'),
        inputRow('surf_b', 'Surface B', 'Surface'),
        // {
        //     id: 'inputs',
        //     type: 'input_stacked',
        //     name: 'Surface',
        //     dataType: 'Surface',
        //     value: initialDataTypeValue['Surface'],
        // },
    ],
    instructions: glsl`
        #INCLUDE inc_union;
        Distance:(vec3) union(Distance:(vec3) surf_a, Distance:(vec3) surf_b) {
            return lambda (vec3 p) : inc_union(surf_a(p), surf_b(p));
        }
        // #INCLUDE inc_union;
        // Solid output = #REDUCE(inc_union, inputs, EMPTY_SOLID_LITERAL);
    `,
}

const difference: GNodeTemplate = {
    id: getTemplateId('static', 'difference'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Difference', templateColors['solid_operators']),
        outputRow('output', 'Difference', 'Surface'),
        inputRow('surf_a', 'Surface A', 'Surface'),
        inputRow('surf_b', 'Surface B', 'Surface'),
        // {
        //     id: 'positive',
        //     type: 'input',
        //     name: 'Surface',
        //     dataType: 'Surface',
        //     value: initialDataTypeValue['Surface'],
        // },
        // {
        //     id: 'negatives',
        //     type: 'input_stacked',
        //     name: 'Complement',
        //     dataType: 'Surface',
        //     value: initialDataTypeValue['Surface'],
        // },
    ],
    instructions: glsl`
        #INCLUDE inc_difference;
        Distance:(vec3) difference(Distance:(vec3) surf_a, Distance:(vec3) surf_b) {
            return lambda (vec3 p) : inc_difference(surf_a(p), surf_b(p));
        }
        // #INCLUDE inc_union, inc_difference;
        // Solid neg = #REDUCE(inc_union, negatives, EMPTY_SOLID_LITERAL);
        // Solid output = inc_difference(positive, neg);
    `,
}

const intersection: GNodeTemplate = {
    id: getTemplateId('static', 'intersection'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Intersection', templateColors['solid_operators']),
        outputRow('output', 'Intersection', 'Surface'),
        inputRow('surf_a', 'Surface A', 'Surface'),
        inputRow('surf_b', 'Surface B', 'Surface'),
        // {
        //     id: 'inputs',
        //     type: 'input_stacked',
        //     name: 'Solid',
        //     dataType: 'Surface',
        //     value: initialDataTypeValue['Surface'],
        // },
    ],
    instructions: glsl`
        #INCLUDE inc_intersection;
        Distance:(vec3) intersection(Distance:(vec3) surf_a, Distance:(vec3) surf_b) {
            return lambda (vec3 p) : inc_intersection(surf_a(p), surf_b(p));
        }
        // #INCLUDE inc_intersection;
        // Solid output = #REDUCE(inc_intersection, inputs, EMPTY_SOLID_LITERAL);
    `,
}

const smooth_union: GNodeTemplate = {
    id: getTemplateId('static', 'smooth_union'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Smooth Union', templateColors['solid_operators']),
        outputRow('output', 'Smooth Union', 'Surface'),
        inputRow('surf_a', 'Surface A', 'Surface'),
        inputRow('surf_b', 'Surface B', 'Surface'),
        inputField('k', 'Smoothness', 'float'),
    ],
    instructions: glsl`
        #INCLUDE inc_smooth_union;
        Distance:(vec3) smooth_union(Distance:(vec3) surf_a, Distance:(vec3) surf_b, float k) {
            return lambda (vec3 p) : inc_smooth_union(surf_a(p), surf_b(p), k);
        }
        // #INCLUDE inc_smooth_union;
        // Solid output = inc_smooth_union(a, b, k);
    `,
}

const smooth_difference: GNodeTemplate = {
    id: getTemplateId('static', 'smooth_difference'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Smooth Difference', templateColors['solid_operators']),
        outputRow('output', 'Smooth Difference', 'Surface'),
        inputRow('surf_a', 'Surface A', 'Surface'),
        inputRow('surf_b', 'Surface B', 'Surface'),
        inputField('k', 'Smoothness', 'float'),
    ],
    instructions: glsl`
        #INCLUDE inc_smooth_difference;
        Distance:(vec3) smooth_difference(Distance:(vec3) surf_a, Distance:(vec3) surf_b, float k) {
            return lambda (vec3 p) : inc_smooth_difference(surf_a(p), surf_b(p), k);
        }
        // #INCLUDE inc_smooth_difference;
        // Solid output = inc_smooth_difference(a, b, k);
    `,
}

const smooth_intersection: GNodeTemplate = {
    id: getTemplateId('static', 'smooth_intersection'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Smooth Intersection', templateColors['solid_operators']),
        outputRow('output', 'Smooth Intersection', 'Surface'),
        inputRow('surf_a', 'Surface A', 'Surface'),
        inputRow('surf_b', 'Surface B', 'Surface'),
        inputField('k', 'Smoothness', 'float'),
    ],
    instructions: glsl`
        #INCLUDE inc_smooth_intersection;
        Distance:(vec3) smooth_intersection(Distance:(vec3) surf_a, Distance:(vec3) surf_b, float k) {
            return lambda (vec3 p) : inc_smooth_intersection(surf_a(p), surf_b(p), k);
        }
        // #INCLUDE inc_smooth_intersection;
        // Solid output = inc_smooth_intersection(a, b, k);
    `,
}

const round_corners: GNodeTemplate = {
    id: getTemplateId('static', 'round_corners'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Round Corners', templateColors['solid_operators']),
        outputRow('output', 'Rounded Surface', 'Surface'),
        inputRow('surf', 'Surface', 'Surface'),
        inputField('radius', 'Radius', 'float', 0),
    ],
    instructions: glsl`
        Distance:(vec3) round_corners(Distance:(vec3) surf, float radius) {
            return lambda (vec3 p) : {
                Distance sd = surf(p);
                return Distance(sd.d - radius, sd.color);
            };
        }
        // Solid output = Solid(solid.sd - radius, solid.color);
    `,
}

const onion: GNodeTemplate  = {
    id: getTemplateId('static', 'onion'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Onion', templateColors['solid_operators']),
        outputRow('output', 'Onioned Surface', 'Surface'),
        inputRow('surf', 'Surface', 'Surface'),
        inputField('thickness', 'Thickness', 'float', 0.1),
    ],
    instructions: glsl`
        Distance:(vec3) onion(Distance:(vec3) surf, float thickness) {
            return lambda (vec3 p) : {
                Distance sd = surf(p);
                return Distance(abs(sd.d) - thickness, sd.color);
            };
        }
        // Solid output = Solid(abs(solid.sd) - thickness, solid.color);
    `,
}

// const extrude_z: GNodeTemplate = {
//     id: getTemplateId('static', 'extrude_z'),
//     version: 0,
//     category: 'solid_operators',
//     rows: [
//         nameRow('Extrude on z-Axis', templateColors['solid_operators']),
//         outputRow('output', 'Extruded', 'Surface'),
//         inputRow('solid', 'xy-Solid', 'Surface'),
//         inputField('height', 'Height', 'float', 1),
//     ],
//     instructions: glsl`
//         #INCLUDE inc_extrude_z;
//         Distance:(vec3) extrude_z(Distance:(vec3) surf, float height) {
//             return lambda (vec3 p) : inc_extrude_z(p, surf, height);
//         }
//         // Solid output = inc_extrude_z(position, solid, height);
//     `,
// }

const set_color: GNodeTemplate = {
    id: getTemplateId('static', 'set_color'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Set Color', templateColors['solid_operators']),
        outputRow('output', 'Colored', 'Surface'),
        inputRow('surf', 'Surface', 'Surface'),
        {
            id: 'color',
            type: 'color',
            dataType: 'vec3',
            name: 'Color',
            value: [1, 1, 1],
        }
    ],
    instructions: glsl`
        Distance:(vec3) set_color(Distance:(vec3) surf, float color) {
            return lambda (vec3 p) : Distance(surf(p).d, color);
        }
        // Solid output = Solid(input.sd, color);
    `,
}

// const operation_correct_distance: GNodeTemplate = {
//     id: getTemplateId('static', 'correct_distance'),
//     version: 0,
//     category: 'solid_operators',
//     rows: [
//         nameRow('Correct Distance', templateColors['solid_operators']),
//         outputRow('output', 'Smooth Union', 'Surface'),
//         inputRow('input', 'Solid', 'Solid'),
//         inputField('factor', 'Factor', 'float', 1),
//     ],
//     instructions: glsl`
//         Solid output = Solid(factor * input.sd, input.color);
//     `,
// }

export default [
    union, difference, intersection,
    smooth_union, smooth_difference, smooth_intersection,

    round_corners, onion,
    // extrude_z,
    set_color, 
    // operation_correct_distance,
];