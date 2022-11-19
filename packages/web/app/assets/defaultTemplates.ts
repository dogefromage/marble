import { ArithmeticOperations, DataTypes, DefaultFunctionArgNames, GNodeT, GNodeTags, GNodeTypes, ProgramOperationTypes, RotationModels, RowTypes, RowValueMap } from "../types";
import { glsl } from "../utils/codeGeneration/glslTag";
import { inc_difference, inc_intersection, inc_sdf_box, inc_sdf_sphere, inc_sdf_z_plane, inc_transform, inc_union } from "./defaultIncludes";

enum TemplateColors
{
    Output = '#a3264e',
    Operators = '#123456',
    Primitives = '#999966',
}

const TEMPLATE_FAR_AWAY = 100000; 
const MAT3_IDENTITY: RowValueMap[DataTypes.Mat3] = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];

const output: GNodeT =
{
    id: 'output',
    type: GNodeTypes.Default,
    tags: [ GNodeTags.Output ],
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
    instructionTemplates: glsl`
        return $input;
    `,
    // operations: [
    //     {
    //         type: ProgramOperationTypes.Return,
    //         var_input: 'input',
    //     },
    // ],
    // includeIds: [],
}

// const op_union: GNodeT =
// {
//     id: 'union',
//     type: GNodeTypes.Default,
//     rows: [
//         {
//             id: 'name',
//             type: RowTypes.Name,
//             name: 'Union',
//             color: TemplateColors.Operators,
//         },
//         {
//             id: 'output',
//             type: RowTypes.Output,
//             dataType: DataTypes.Float,
//             name: 'Union',
//         },
//         {
//             id: 'inputs',
//             type: RowTypes.InputStacked,
//             name: 'Solid',
//             dataType: DataTypes.Float,
//             value: TEMPLATE_FAR_AWAY,
//         },
//     ],
//     operations: [
//         {
//             type: ProgramOperationTypes.InvocationTree,
//             name_function: 'inc_union',
//             row_args: 'inputs',
//             zero_value: TEMPLATE_FAR_AWAY,
//             row_output: 'output',
//             type_output: DataTypes.Float,
//         },
//     ],
//     includeIds: [ inc_union.id ],
// }

// const op_difference: GNodeT =
// {
//     id: 'difference',
//     type: GNodeTypes.Default,
//     rows: [
//         {
//             id: 'name',
//             type: RowTypes.Name,
//             name: 'Difference',
//             color: TemplateColors.Operators,
//         },
//         {
//             id: 'output',
//             type: RowTypes.Output,
//             dataType: DataTypes.Float,
//             name: 'Difference',
//         },
//         {
//             id: 'positive',
//             type: RowTypes.InputOnly,
//             name: 'Start Solid',
//             dataType: DataTypes.Float,
//             value: TEMPLATE_FAR_AWAY,
//         },
//         {
//             id: 'negatives',
//             type: RowTypes.InputStacked,
//             name: 'Complement',
//             dataType: DataTypes.Float,
//             value: TEMPLATE_FAR_AWAY,
//         },
//     ],
//     operations:
//     [
//         {
//             type: ProgramOperationTypes.InvocationTree,
//             name_function: 'inc_union',
//             row_args: 'negatives',
//             zero_value: TEMPLATE_FAR_AWAY,
//             row_output: '$1',
//             type_output: DataTypes.Float,
//         },
//         {
//             type: ProgramOperationTypes.Invocation,
//             name_function: 'inc_difference',
//             row_args: [ 'positive', '$1' ],
//             row_output: 'output',
//             type_output: DataTypes.Float,
//         },
//     ],
//     includeIds: [ inc_union.id, inc_difference.id ],
// }

// const op_intersection: GNodeT =
// {
//     id: 'intersection',
//     type: GNodeTypes.Default,
//     rows: [
//         {
//             id: 'name',
//             type: RowTypes.Name,
//             name: 'Intersection',
//             color: TemplateColors.Operators,
//         },
//         {
//             id: 'output',
//             type: RowTypes.Output,
//             dataType: DataTypes.Float,
//             name: 'Intersection',
//         },
//         {
//             id: 'inputs',
//             type: RowTypes.InputStacked,
//             name: 'Solid',
//             dataType: DataTypes.Float,
//             value: TEMPLATE_FAR_AWAY,
//         },
//     ],
//     operations: [
//         {
//             type: ProgramOperationTypes.InvocationTree,
//             name_function: 'inc_intersection',
//             row_args: 'inputs',
//             zero_value: TEMPLATE_FAR_AWAY,
//             row_output: 'output',
//             type_output: DataTypes.Float,
//         },
//     ],
//     includeIds: [ inc_intersection.id ],
// }

// const sdf_sphere: GNodeT =
// {
//     id: 'sdf_sphere',
//     type: GNodeTypes.Default,
//     rows: [
//         {
//             id: 'name',
//             type: RowTypes.Name,
//             name: 'Sphere',
//             color: TemplateColors.Primitives,
//         },
//         {
//             id: 'output',
//             type: RowTypes.Output,
//             dataType: DataTypes.Float,
//             name: 'SDF',
//         },
//         {
//             id: 'coordinates',
//             type: RowTypes.InputOnly,
//             name: 'Coordinates',
//             dataType: DataTypes.Vec3,
//             value: [ 0, 0, 0 ],
//             alternativeArg: DefaultFunctionArgNames.RayPosition,
//         },
//         {
//             id: 'radius',
//             type: RowTypes.Field,
//             dataType: DataTypes.Float,
//             name: 'Radius',
//             value: 1,
//         }
//     ],
//     operations: [
//         {
//             type: ProgramOperationTypes.Invocation,
//             name_function: 'inc_sdf_sphere',
//             row_args: [ 'coordinates', 'radius' ],
//             row_output: 'output',
//             type_output: DataTypes.Float,
//         },
//     ],
//     includeIds: [ inc_sdf_sphere.id ],
// }

// const add: GNodeT =
// {
//     id: 'add',
//     type: GNodeTypes.Default,
//     rows: [
//         {
//             id: 'name',
//             type: RowTypes.Name,
//             name: 'Add',
//             color: '#123456',
//         },
//         {
//             id: 'c',
//             type: RowTypes.Output,
//             dataType: DataTypes.Float,
//             name: 'C',
//         },
//         {
//             id: 'a',
//             type: RowTypes.Field,
//             name: 'A',
//             dataType: DataTypes.Float,
//             value: 0,
//         },
//         {
//             id: 'b',
//             type: RowTypes.Field,
//             name: 'B',
//             dataType: DataTypes.Float,
//             value: 0,
//         },
//     ],
//     operations: [
//         {
//             type: ProgramOperationTypes.BinaryArithmetic,
//             row_lhs: 'a',
//             row_rhs: 'b',
//             row_output: 'c',
//             operation: ArithmeticOperations.Add,
//             type_output: DataTypes.Float,
//         },
//     ],
//     includeIds: [],
// }

const sdf_box: GNodeT =
{
    id: 'sdf_box',
    type: GNodeTypes.Default,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Box',
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
            dataType: DataTypes.Vec3,
            name: 'Size',
            value: [ 1, 1, 1 ],
        }
    ],
    instructionTemplates: glsl`
        #INCLUDE inc_sdf_box;
        float $output = inc_sdf_box($coordinates, $size);
    `,
    // operations: [
    //     {
    //         type: ProgramOperationTypes.Invocation,
    //         name_function: 'inc_sdf_box',
    //         row_args: [ 'coordinates', 'size' ],
    //         row_output: 'output',
    //         type_output: DataTypes.Float,
    //     },
    // ],
    // includeIds: [ inc_sdf_box.id ],
}

// const sdf_plane: GNodeT =
// {
//     id: 'sdf_plane',
//     type: GNodeTypes.Default,
//     rows: [
//         {
//             id: 'name',
//             type: RowTypes.Name,
//             name: 'z-Plane',
//             color: TemplateColors.Primitives,
//         },
//         {
//             id: 'output',
//             type: RowTypes.Output,
//             dataType: DataTypes.Float,
//             name: 'SDF',
//         },
//         {
//             id: 'coordinates',
//             type: RowTypes.InputOnly,
//             name: 'Coordinates',
//             dataType: DataTypes.Vec3,
//             value: [ 0, 0, 0 ],
//             alternativeArg: DefaultFunctionArgNames.RayPosition,
//         },
//         {
//             id: 'height',
//             type: RowTypes.Field,
//             dataType: DataTypes.Float,
//             name: 'Height',
//             value: 0,
//         }
//     ],
//     operations: [
//         {
//             type: ProgramOperationTypes.Invocation,
//             name_function: 'inc_sdf_z_plane',
//             row_args: [ 'coordinates', 'height' ],
//             row_output: 'output',
//             type_output: DataTypes.Float,
//         },
//     ],
//     includeIds: [ inc_sdf_z_plane.id ],
// }

const op_transform: GNodeT =
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
        {
            id: 'rotation',
            type: RowTypes.Rotation,
            dataType: DataTypes.Mat3,
            rotationModel: RotationModels.Euler_XYZ,
            name: 'Rotation',
            value: MAT3_IDENTITY,
        },
    ],
    instructionTemplates: glsl`
        #INCLUDE inc_transform;
        vec3 $output = inc_transform($input, $translation, $rotation);
    `,
    // operations:
    //     [
    //         {
    //             type: ProgramOperationTypes.Invocation,
    //             name_function: 'inc_transform',
    //             row_args: [ 'input', 'translation', 'rotation' ],
    //             row_output: 'output',
    //             type_output: DataTypes.Vec3,
    //         },
    //     ],
    // includeIds: [ inc_transform.id ],
}

const defaultTemplates: GNodeT[] =
    [
        // sdf_sphere,
        sdf_box,
        // sdf_plane,

        // op_union,
        // op_difference,
        // op_intersection,
        op_transform,

        output,
        // add,
    ];

export default defaultTemplates;