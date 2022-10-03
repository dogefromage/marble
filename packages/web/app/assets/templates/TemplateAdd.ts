import { GNodeT, GNodeTypes, RowTypes, DataTypes, ProgramOperationTypes, ArithmeticOperations } from "../../types";

const template_add: GNodeT =
{
    id: 'add',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Add',
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
            type: RowTypes.Field,
            name: 'A',
            dataType: DataTypes.Float,
            value: 0,
        },
        {
            id: 'b',
            type: RowTypes.Field,
            name: 'B',
            dataType: DataTypes.Float,
            value: 0,
        },
    ],
    operation: 
    {
        type: ProgramOperationTypes.Arithmetic,
        lhsRowId: 'a',
        rhsRowId: 'b',
        outputRowId: 'c',
        operation: ArithmeticOperations.Add,
        outputDatatype: DataTypes.Float,
    },
    glslSnippedIds: [],
}

export default template_add;