import { DataTypes, DefaultFunctionArgNames, GLSLSnippet, GNodeT, GNodeTypes, ProgramOperationTypes, RowTypes } from "../../types"
import { glsl } from "../../utils/codeGeneration/glslTag";
import { TemplateColors } from "../constants";

const code = glsl`
float inc_sdf_sphere(vec3 p, float r)
{
    return length(p) - r;
}
`;

export const inc_sdf_sphere: GLSLSnippet = 
{
    id: 'inc_sdf_sphere',
    code,
};

const template_sdf_sphere: GNodeT = 
{
    id: 'sdf_sphere',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Sphere',
            color: TemplateColors.Primitives,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'SDF',
        },
        {
            id: 'coordinates',
            type: RowTypes.InputOnly,
            name: 'Coordinates',
            dataType: DataTypes.Vec3,
            value: [ 0, 0, 0 ],
            alternativeArg: DefaultFunctionArgNames.RayPosition,
        },
        {
            id: 'radius',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Radius',
            value: 1,
        }
    ],
    operation: 
    {
        type: ProgramOperationTypes.Call,
        functionName: 'inc_sdf_sphere',
        argumentRowIds: [ 'coordinates', 'radius' ],
        outputRowId: 'output',
        outputDatatype: DataTypes.Float,
    },
    glslSnippedIds: [ inc_sdf_sphere.id ],
}

export default template_sdf_sphere