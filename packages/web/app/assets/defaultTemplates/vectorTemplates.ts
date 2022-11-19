import { DataTypes, DefaultFunctionArgNames, RotationModels } from "../../types"
import { GNodeT, GNodeTemplateCategories, GNodeTemplateTypes, RowTypes } from "../../types/geometries"
import { glsl } from "../../utils/codeGeneration/glslTag"
import { TemplateColors, MAT3_IDENTITY } from "./templateConstants"

const vectors_mirror_x: GNodeT =
{
    id: 'mirror_x',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Vectors,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Mirror X',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Vec3,
            name: 'Mirrored',
        },
        {
            id: 'input',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Vec3,
            alternativeArg: DefaultFunctionArgNames.RayPosition,
            value: [ 0, 0, 0 ],
            name: 'Point',
        }
    ],
    instructionTemplates: glsl`
        vec3 $output = vec3(abs($input.x), $input.yz);
    `,
}

const vectors_transform: GNodeT =
{
    id: 'transform',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Vectors,
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
        vec3 $output = $rotation * ($input - $translation);
    `,
}

const vectors_separate_3x1: GNodeT =
{
    id: 'separate_3x1',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Vectors,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Separate XYZ',
            color: '#123456',
        },
        {
            id: 'x',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'X',
        },
        {
            id: 'y',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'Y',
        },
        {
            id: 'z',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'Z',
        },
        {
            id: 'input',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Vec3,
            name: 'Input Vector',
            value: [ 0, 0, 0 ],
        },
    ],
    instructionTemplates: glsl`
        float $x = $input.x;
        float $y = $input.y;
        float $z = $input.z;
    `,
}

const vectors_separate_2x1: GNodeT =
{
    id: 'separate_2x1',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Vectors,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Separate XY',
            color: '#123456',
        },
        {
            id: 'x',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'X',
        },
        {
            id: 'y',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'Y',
        },
        {
            id: 'input',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Vec2,
            name: 'Input Vector',
            value: [ 0, 0 ],
        },
    ],
    instructionTemplates: glsl`
        float $x = $input.x;
        float $y = $input.y;
    `,
}

export default [
    vectors_mirror_x,
    vectors_transform,
    vectors_separate_3x1,
    vectors_separate_2x1,
];