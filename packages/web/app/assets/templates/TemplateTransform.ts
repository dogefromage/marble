import { GNodeT, GNodeTypes, RowTypes, DataTypes, DefaultFunctionArgNames, ProgramOperationTypes, ProgramInclude } from "../../types";
import { glsl } from "../../utils/codeGeneration/glslTag";

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
    operationOptions: 
    {
        type: ProgramOperationTypes.Invocation,
        functionName: 'inc_transform',
        argumentRowIds: [ 'input', 'translation' ],
        outputRowId: 'output',
        outputDatatype: DataTypes.Vec3,
    },
    includeIds: [ inc_transform.id ],
}

export default template_transform;