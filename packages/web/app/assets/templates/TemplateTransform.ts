import { GNodeT, GNodeTypes, RowTypes, DataTypes, DefaultFunctionArgNames, ProgramOperationTypes, GLSLSnippet } from "../../types";
import { glsl } from "../../utils/codeGeneration/glslTag";

const code = glsl`
vec3 inc_transform(vec3 x, vec3 translate)
{
    return x - translate;
}
`;

export const inc_transform: GLSLSnippet = 
{
    id: 'inc_transform',
    code,
};

const template_transform: GNodeT =
{
    id: 'transform',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Transform',
            color: '#123456',
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Vec3,
            name: 'Output Pos',
        },
        {
            id: 'input',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Vec3,
            name: 'Input Pos',
            value: [ 0, 0, 0 ],
            alternativeArg: DefaultFunctionArgNames.RayPosition,
        },
        {
            id: 'translation',
            type: RowTypes.Field,
            dataType: DataTypes.Vec3,
            name: 'Translation',
            value: [ 0, 0, 0 ],
        },
    ],
    operation: 
    {
        type: ProgramOperationTypes.Call,
        functionName: 'inc_transform',
        argumentRowIds: [ 'input', 'translation' ],
        outputRowId: 'output',
        outputDatatype: DataTypes.Vec3,
    },
    glslSnippedIds: [ inc_transform.id ],
}

export default template_transform;