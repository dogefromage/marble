import { GNodeT, GNodeTypes, RowTypes, DataTypes, ProgramOperationTypes } from "../../types";
import { TEMPLATE_FAR_AWAY } from "../constants";

const template_output: GNodeT =
{
    id: 'output',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Output',
            color: '#a3264e',
        },
        {
            id: 'input',
            name: 'SDF',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Float,
            value: TEMPLATE_FAR_AWAY,
        },
    ],
    operation: 
    {
        type: ProgramOperationTypes.Output,
        inputRowId: 'input'
    },
    glslSnippedIds: [],
}

export default template_output;