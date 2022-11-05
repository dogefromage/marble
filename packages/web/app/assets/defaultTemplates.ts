import { ArithmeticOperations, DataTypes, DefaultFunctionArgNames, GNodeT, GNodeTypes, MAX_LENGTH, ProgramOperationTypes, RowTypes } from "../types";
import { inc_difference, inc_intersection, inc_sdf_cube, inc_sdf_sphere, inc_sdf_z_plane, inc_transform, inc_union } from "./defaultIncludes";

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
        zero_value: TEMPLATE_FAR_AWAY,
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
    operationOptions: 
    {
        type: ProgramOperationTypes.BinaryArithmetic,
        row_lhs: 'a',
        row_rhs: 'b',
        row_output: 'c',
        operation: ArithmeticOperations.Add,
    },
    includeIds: [],
}

const template_difference: GNodeT =
{
    id: 'difference',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Difference',
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
        name_function: 'inc_difference',
        row_args: [ 'a', 'b' ],
        row_output: 'c',
    },
    includeIds: [ inc_difference.id ],
}

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
        name_function: 'inc_intersection',
        row_args: [ 'a', 'b' ],
        row_output: 'c',
    },
    includeIds: [ inc_intersection.id ],
}

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
        name_function: 'inc_sdf_cube',
        row_args: [ 'coordinates', 'size' ],
        row_output: 'output',
    },
    includeIds: [ inc_sdf_cube.id ],
}

const template_sdf_plane: GNodeT = 
{
    id: 'sdf_plane',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'z-Plane',
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
            id: 'height',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Height',
            value: 0,
        }
    ],
    operationOptions: 
    {
        type: ProgramOperationTypes.Invocation,
        name_function: 'inc_sdf_z_plane',
        row_args: [ 'coordinates', 'height' ],
        row_output: 'output',
    },
    includeIds: [ inc_sdf_z_plane.id ],
}

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
        name_function: 'inc_transform',
        row_args: [ 'input', 'translation' ],
        row_output: 'output',
    },
    includeIds: [ inc_transform.id ],
}

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
        name_function: 'inc_union',
        row_args: [ 'a', 'b' ],
        row_output: 'c',
    },
    includeIds: [ inc_union.id ],
}

const defaultTemplates: GNodeT[] = 
[ 
    output,
    n_union,
    sdf_sphere,
    template_add,
    template_difference,
    template_intersection,
    template_sdf_cube,
    template_sdf_plane,
    template_transform,
    template_union,
];

export default defaultTemplates;