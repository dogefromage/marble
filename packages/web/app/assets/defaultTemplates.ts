import { DataTypes, DefaultFunctionArgNames, GNodeT, GNodeTypes, ProgramOperationTypes, RowTypes } from "../types";
import { inc_sdf_sphere, inc_union } from "./defaultIncludes";

enum TemplateColors
{
    Output = '#a3264e',
    Operators = '#123456',
    Primitives = '#999966',
}

export const TEMPLATE_FAR_AWAY = 100000;

const output: GNodeT =
{
    id: 'output',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Output',
            color: TemplateColors.Output,
        },
        {
            id: 'input',
            name: 'SDF',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Float,
            value: TEMPLATE_FAR_AWAY,
        },
    ],
    operationOptions: 
    {
        type: ProgramOperationTypes.Return,
        var_input: 'input',
    },
    includeIds: [],
}

const n_union: GNodeT =
{
    id: 'n_union',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'N-Union',
            color: TemplateColors.Operators,
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
    operationOptions: 
    {
        type: ProgramOperationTypes.InvocationTree,
        name_function: 'inc_union',
        row_args: 'inputs',
        row_output: 'output',
    },
    includeIds: [ inc_union.id ],
}

const sdf_sphere: GNodeT = 
{
    id: 'sdf_sphere',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Sphere',
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
            id: 'radius',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Radius',
            value: 1,
        }
    ],
    operationOptions: 
    {
        type: ProgramOperationTypes.Invocation,
        name_function: 'inc_sdf_sphere',
        row_args: [ 'coordinates', 'radius' ],
        row_output: 'output',
    },
    includeIds: [ inc_sdf_sphere.id ],
}

const defaultTemplates: GNodeT[] = 
[ 
    output,
    n_union,
    sdf_sphere,
    // template_add,
    // template_difference,
    // template_sdf_cube,
    // template_sdf_plane,
    // template_transform,
    // template_union,
    // template_intersection,
];

export default defaultTemplates;