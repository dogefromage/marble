import { DataTypes, DefaultFunctionArgNames, GLSLSnippet, GNodeT, GNodeTypes, ProgramOperationTypes, RowTypes } from "../../types";
import { glsl } from "../../utils/codeGeneration/glslTag";
import { TemplateColors } from "../constants";

const code = glsl`
float inc_sdf_cube(vec3 p, float s)
{
    vec3 b = vec3(s, s, s);
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}
`;

export const inc_sdf_cube: GLSLSnippet = 
{
    id: 'inc_sdf_cube',
    code,
};

const template_sdf_cube: GNodeT = 
{
    id: 'sdf_cube',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Cube',
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
            id: 'size',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Size',
            value: 1,
        }
    ],
    operation: 
    {
        type: ProgramOperationTypes.Call,
        functionName: 'inc_sdf_cube',
        argumentRowIds: [ 'coordinates', 'size' ],
        outputRowId: 'output',
        outputDatatype: DataTypes.Float,
    },
    glslSnippedIds: [ inc_sdf_cube.id ],
}

export default template_sdf_cube;