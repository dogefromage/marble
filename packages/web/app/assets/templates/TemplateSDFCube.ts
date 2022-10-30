import { DataTypes, DefaultFunctionArgNames, ProgramInclude, GNodeT, GNodeTypes, ProgramOperationTypes, RowTypes } from "../../types";
import { glsl } from "../../utils/codeGeneration/glslTag";
import { TemplateColors } from "../constants";

const template_sdf_cube: GNodeT = 
{
    id: 'sdf_cube',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Cube',
            color: TemplateColors.Primitives,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'SDF',
        },
        {
            id: 'coordinates',
            type: RowTypes.InputOnly,
            name: 'Coordinates',
            dataType: DataTypes.Vec3,
            value: [ 0, 0, 0 ],
            alternativeArg: DefaultFunctionArgNames.RayPosition,
        },
        {
            id: 'size',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Size',
            value: 1,
        }
    ],
    operationOptions: 
    {
        type: ProgramOperationTypes.Invocation,
        functionName: 'inc_sdf_cube',
        argumentRowIds: [ 'coordinates', 'size' ],
        outputRowId: 'output',
        outputDatatype: DataTypes.Float,
    },
    includeIds: [ inc_sdf_cube.id ],
}

export default template_sdf_cube;