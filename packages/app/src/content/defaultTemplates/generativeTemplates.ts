import { getTemplateId, GNodeTemplate } from "../../types";
import { glsl } from "../../utils/codeStrings";

const generative_perlin_noise: GNodeTemplate =
{
    id: getTemplateId('perlin_noise', 'static'),
    version: 0,
    category: 'generative',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Perlin Noise',
            color: "#654321",
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'float',
            name: 'Noise',
        },
        {
            id: 'position',
            type: 'input',
            name: 'Position',
            dataType: 'vec3',
            value: [ 0, 0, 0 ],
            defaultArgumentToken: 'position',
        }
    ],
    instructions: glsl`
        #INCLUDE inc_perlin_noise;
        float output = inc_perlin_noise(position);
    `,
}

export default [
    generative_perlin_noise,
]