import { GNodeT, GNodeTypes, RowTypes, DataTypes, DefaultFunctionArgNames, ProgramOperationTypes, GLSLSnippet } from "../../types"
import { glsl } from "../../utils/codeGeneration/glslTag";
import { TemplateColors } from "../constants";

const code = glsl`
float inc_sdf_z_plane(vec3 p, float h)
{
    return p.z - h;
}
`;

export const inc_sdf_z_plane: GLSLSnippet = 
{
    id: 'inc_sdf_z_plane',
    code,
};

const template_sdf_plane: GNodeT = 
{
    id: 'sdf_plane',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'z-Plane',
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
            id: 'height',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Height',
            value: 0,
        }
    ],
    operation: 
    {
        type: ProgramOperationTypes.Call,
        functionName: 'inc_sdf_z_plane',
        argumentRowIds: [ 'coordinates', 'height' ],
        outputRowId: 'output',
        outputDatatype: DataTypes.Float,
    },
    glslSnippedIds: [ inc_sdf_z_plane.id ],
}

export default template_sdf_plane