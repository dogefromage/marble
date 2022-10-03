import { GNodeT, GNodeTypes, RowTypes, DataTypes, ProgramOperationTypes, GLSLSnippet } from "../../types";
import { glsl } from "../../utils/codeGeneration/glslTag";
import { TEMPLATE_FAR_AWAY } from "../constants";

const code = glsl`
float inc_difference(float a, float b)
{
    return max(a, -b);
}
`;

export const inc_difference: GLSLSnippet = 
{
    id: 'inc_difference',
    code,
};

const template_difference: GNodeT =
{
    id: 'difference',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Difference',
            color: '#123456',
        },
        {
            id: 'c',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'C',
        },
        {
            id: 'a',
            type: RowTypes.InputOnly,
            name: 'A',
            dataType: DataTypes.Float,
            value: TEMPLATE_FAR_AWAY,
        },
        {
            id: 'b',
            type: RowTypes.InputOnly,
            name: 'B',
            dataType: DataTypes.Float,
            value: 0,
        },
    ],
    operation: 
    {
        type: ProgramOperationTypes.Call,
        functionName: 'inc_difference',
        argumentRowIds: [ 'a', 'b' ],
        outputRowId: 'c',
        outputDatatype: DataTypes.Float,
    },
    glslSnippedIds: [ inc_difference.id ],
}

export default template_difference;