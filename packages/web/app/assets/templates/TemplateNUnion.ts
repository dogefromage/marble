import { DataTypes, GNodeT, GNodeTypes, ProgramOperationTypes, RowTypes } from "../../types";
import { TEMPLATE_FAR_AWAY } from "../constants";

// const code = glsl`
// float inc_union(float a, float b)
// {
//     return min(a, b);
// }
// `;

// export const inc_union: GLSLSnippet = 
// {
//     id: 'inc_union',
//     code,
// };

const template_n_union: GNodeT =
{
    id: 'n_union',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'N-Union',
            color: '#123456',
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'Union',
        },
        {
            id: 'inputs',
            type: RowTypes.InputStacked,
            name: 'Input',
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
    glslSnippedIds: [ ]//inc_union.id ],
}

export default template_n_union;