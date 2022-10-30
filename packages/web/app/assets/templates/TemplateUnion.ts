import { GNodeT, GNodeTypes, RowTypes, DataTypes, ProgramOperationTypes, ProgramInclude } from "../../types";
import { glsl } from "../../utils/codeGeneration/glslTag";
import { TEMPLATE_FAR_AWAY } from "../constants";

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
    operationOptions: 
    {
        type: ProgramOperationTypes.Invocation,
        functionName: 'inc_union',
        argumentRowIds: [ 'a', 'b' ],
        outputRowId: 'c',
        outputDatatype: DataTypes.Float,
    },
    includeIds: [ inc_union.id ],
}

export default template_union;