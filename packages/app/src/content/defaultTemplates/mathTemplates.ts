

// const math_number_value: GNodeTemplate = {
//     id: getTemplateId('static', 'number_value'),
//     version: 0,
//     category: 'math',
//     rows: [
//         nameRow('Number Value', templateColors['math']),
//         outputRow('output', 'Value', 'float'),
//         inputField('input', 'Input', 'float'),
//     ],
//     instructions: glsl`
//         float number_value(float input) {
//             return input;
//         }
//     `,
// }

// const math_map: GNodeTemplate = {
//     id: getTemplateId('static', 'map'),
//     version: 0,
//     category: 'math',
//     rows: [
//         nameRow('Map', templateColors['math']),
//         outputRow('output', 'map(x)', 'float'),
//         inputRow('x', 'x', 'float'),
//         inputField('from_min', 'From Min', 'float', 0),
//         inputField('from_max', 'From Max', 'float', 1),
//         inputField('to_min', 'To Min', 'float', 0),
//         inputField('to_max', 'To Max', 'float', 1),
//     ],
//     instructions: glsl`
//         float math_map(float x, float from_min, float from_max, float to_min, float to_max) {
//             float t = (x - from_min) / (from_max - from_min);
//             return to_min + t * (to_max - to_min);
//         }
//     `,
// }

// const evaluate_bezier: GNodeTemplate = {
//     id: getTemplateId('static', 'evaluate_bezier'),
//     version: 0,
//     category: 'math',
//     rows: [
//         nameRow('Evaluate Bezier', templateColors['math']),
//         outputRow('y', 'y-Value', 'float'),
//         {
//             id: 'bezier',
//             name: 'Bezier Curve',
//             type: 'bezier',
//             dataType: 'mat3',
//             value: [0, 0, 0.2, 0.7, 0.6, 0.4, 1, 0.7, 0],
//         },
//         inputRow('x', 'x-Value', 'float'),
//     ],
//     instructions: glsl`
//         // implement
//     `,
// }

export default [
    // math_number_value,
    // math_map,
    // evaluate_bezier,
];