import { DataTypes, DefaultArgumentIds, GNodeT, GNodeTemplateCategories, GNodeTemplateTypes, RowTypes } from "../../types";
import { glsl } from "../../utils/codeStrings";

const generative_perlin_noise: GNodeT =
{
    id: 'perlin_noise',
    version: 0,
    type: GNodeTemplateTypes.Base,
    category: GNodeTemplateCategories.Generative,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Perlin Noise',
            color: "#654321",
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'Noise',
        },
        {
            id: 'coordinates',
            type: RowTypes.InputOnly,
            name: 'Coordinates',
            dataType: DataTypes.Vec3,
            value: [ 0, 0, 0 ],
            defaultArgumentToken: DefaultArgumentIds.RayPosition,
        }
    ],
    instructions: glsl`
        #INCLUDE inc_perlin_noise;
        float output = inc_perlin_noise(coordinates);
    `,
}

export default [
    generative_perlin_noise,
]