import { DataTypes, DefaultFunctionArgNames, GNodeT, GNodeTemplateCategories, GNodeTemplateTypes, RowTypes } from "../../types";
import { glsl } from "../../utils/codeGeneration/glslTag";

const generative_perlin_noise: GNodeT =
{
    id: 'perlin_noise',
    type: GNodeTemplateTypes.Default,
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
            defaultArgumentToken: DefaultFunctionArgNames.RayPosition,
        }
    ],
    instructionTemplates: glsl`
        #INCLUDE inc_perlin_noise;
        float $output = inc_perlin_noise($coordinates);
    `,
}

export default [
    generative_perlin_noise,
]