import { GNodeT, GNodeTypes, RowTypes, DataTypes, ProgramOperationTypes, GLSLSnippet } from "../../types";
import { glsl } from "../../utils/codeGeneration/glslTag";
import { TEMPLATE_FAR_AWAY } from "../constants";

const code = glsl`
float inc_union(float a, float b)
{
    return min(a, b);
}
`;

export const inc_union: GLSLSnippet = 
{
    id: 'inc_union',
    code,
};

const template_union: GNodeT =
{
    id: 'union',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Union',
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
            value: TEMPLATE_FAR_AWAY,
        },
    ],
    operation: 
    {
        type: ProgramOperationTypes.Call,
        functionName: 'inc_union',
        argumentRowIds: [ 'a', 'b' ],
        outputRowId: 'c',
        outputDatatype: DataTypes.Float,
    },
    glslSnippedIds: [ inc_union.id ],
}

export default template_union;