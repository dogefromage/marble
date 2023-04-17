
// const generative_perlin_noise: GNodeTemplate = {
//     id: getTemplateId('static', 'perlin_noise'),
//     version: 0,
//     category: 'generative',
//     rows: [
//         {
//             id: 'name',
//             type: 'name',
//             name: 'Perlin Noise',
//             color: "#654321",
//         },
//         {
//             id: 'output',
//             type: 'output',
//             dataType: 'float',
//             name: 'Noise',
//         },
//         {
//             id: 'position',
//             type: 'input',
//             name: 'Position',
//             dataType: 'vec3',
//             value: [0, 0, 0],
//             defaultParameter: 'position',
//         }
//     ],
//     instructions: glsl`
//         #INCLUDE inc_perlin_noise;
//         float output = inc_perlin_noise(position);
//     `,
// }

// const generative_voronoi: GNodeTemplate = {
//     id: getTemplateId('static', 'voronoi'),
//     version: 0,
//     category: 'generative',
//     rows: [
//         {
//             id: 'name',
//             type: 'name',
//             name: 'Voronoi',
//             color: "#654321",
//         },
//         {
//             id: 'dist',
//             type: 'output',
//             dataType: 'float',
//             name: 'Distance',
//         },
//         {
//             id: 'point',
//             type: 'output',
//             dataType: 'vec3',
//             name: 'Point',
//         },
//         {
//             id: 'scale',
//             type: 'field',
//             dataType: 'float',
//             name: 'Scale',
//             value: 1,
//         },
//         {
//             id: 'margin',
//             type: 'field',
//             dataType: 'float',
//             name: 'Margin',
//             value: 0,
//         },
//         {
//             id: 'position',
//             type: 'input',
//             name: 'Position',
//             dataType: 'vec3',
//             value: [0, 0, 0],
//             defaultParameter: 'position',
//         }
//     ],
//     instructions: glsl`
//         #INCLUDE inc_voronoi;
//         vec4 vor = inc_voronoi(position, scale, margin);
//         float dist = vor.w;
//         vec3 point = vor.xyz;
//     `,
// }

export default [
    // generative_perlin_noise,
    // generative_voronoi,
]