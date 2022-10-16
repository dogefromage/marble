import { GNodeT, GNodeTypes, RowTypes, DataTypes, ProgramOperationTypes, GLSLSnippet } from "../../types";
import { glsl } from "../../utils/codeGeneration/glslTag";
import { TEMPLATE_FAR_AWAY } from "../constants";

const code = glsl`
float inc_intersection(float a, float b)
{
    return max(a, b);
}
`;

export const inc_intersection: GLSLSnippet = 
{
    id: 'inc_intersection',
    code,
};

const template_intersection: GNodeT =
{
    id: 'intersection',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Intersection',
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
        functionName: 'inc_intersection',
        argumentRowIds: [ 'a', 'b' ],
        outputRowId: 'c',
        outputDatatype: DataTypes.Float,
    },
    glslSnippedIds: [ inc_intersection.id ],
}

export default template_intersection;