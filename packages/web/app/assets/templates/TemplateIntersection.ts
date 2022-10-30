import { GNodeT, GNodeTypes, RowTypes, DataTypes, ProgramOperationTypes, ProgramInclude } from "../../types";
import { glsl } from "../../utils/codeGeneration/glslTag";
import { TEMPLATE_FAR_AWAY } from "../constants";

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
    operationOptions: 
    {
        type: ProgramOperationTypes.Invocation,
        functionName: 'inc_intersection',
        argumentRowIds: [ 'a', 'b' ],
        outputRowId: 'c',
        outputDatatype: DataTypes.Float,
    },
    includeIds: [ inc_intersection.id ],
}

export default template_intersection;