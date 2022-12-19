import { DataTypes, DefaultFunctionArgNames, RotationModels } from "../../types"
import { GNodeT, GNodeTemplateCategories, GNodeTemplateTypes, RowTypes } from "../../types/geometries"
import { glsl } from "../../utils/codeGeneration/glslTag"
import { TemplateColors, MAT3_IDENTITY } from "./templateConstants"

const vectors_mirror_plane: GNodeT =
{
    id: 'mirror_plane',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Vectors,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Mirror on Plane',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Vec3,
            name: 'Mirrored',
        },
        {
            id: 'x',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Vec3,
            defaultArgument: DefaultFunctionArgNames.RayPosition,
            value: [ 0, 0, 0 ],
            name: 'Coordinate',
        },
        {
            id: 'o',
            type: RowTypes.Field,
            dataType: DataTypes.Vec3,
            value: [ 0, 0, 0 ],
            name: 'Plane Origin',
        },
        {
            id: 'n',
            type: RowTypes.Field,
            dataType: DataTypes.Vec3,
            value: [ 1, 0, 0 ],
            name: 'Plane Normal',
        }
    ],
    instructionTemplates: glsl`
        vec3 $norm = normalize($n);
        float $xn = dot($norm, $x - $o);
        vec3 $output = $x - $norm * (abs($xn) + $xn); // mirror if dot negative, nothing if positive
    `,
}

const vectors_repeat_cell: GNodeT =
{
    id: 'repeat_cell',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Vectors,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Repeat Cell',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: RowTypes.Output,
            dataType: DataTypes.Vec3,
            name: 'Cell Coord',
        },
        {
            id: 'x',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Vec3,
            defaultArgument: DefaultFunctionArgNames.RayPosition,
            value: [ 0, 0, 0 ],
            name: 'Coordinate',
        },
        {
            id: 'size',
            type: RowTypes.Field,
            dataType: DataTypes.Vec3,
            value: [ 1, 1, 1 ],
            name: 'Cell Size',
        },
    ],
    instructionTemplates: glsl`
        // vec3 c = floor((p + size*0.5)/size);
        vec3 $output = mod($x + $size*0.5, $size) - $size*0.5;
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
            id: 'sd_correction',
            type: RowTypes.Output,
            dataType: DataTypes.Float,
            name: 'SD Correction',
        },
        {
            id: 'input',
            type: RowTypes.InputOnly,
            dataType: DataTypes.Vec3,
            name: 'Input Pos',
            value: [ 0, 0, 0 ],
            defaultArgument: DefaultFunctionArgNames.RayPosition,
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
        {
            id: 'scale',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Scale',
            value: 1,
        }
    ],
    instructionTemplates: glsl`
        vec3 $output = $rotation * ($input - $translation) / $scale;
        float $sd_correction = $scale;
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
    vectors_mirror_plane,
    vectors_repeat_cell,
    vectors_transform,
    vectors_separate_3x1,
    vectors_separate_2x1,
];