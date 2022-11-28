import { DataTypes, DefaultFunctionArgNames, GNodeT, GNodeTemplateCategories, GNodeTemplateTypes, RowTypes } from "../../types"
import { glsl } from "../../utils/codeGeneration/glslTag"
import { TemplateColors } from "./templateConstants"

const solid_sphere: GNodeT =
{
    id: 'sphere',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Solids,
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
    instructionTemplates: glsl`
        float $output = length($coordinates) - $radius;
    `,
}

const solid_torus: GNodeT =
{
    id: 'torus',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Solids,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Torus',
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
            id: 'large_r',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Large rad.',
            value: 1,
        },
        {
            id: 'small_r',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Small rad.',
            value: 0.5,
        }
    ],
    instructionTemplates: glsl`
        vec2 $q = vec2(length($coordinates.xz) - $large_r, $coordinates.y);
        float $output = length($q) - $small_r;
    `,
}

const solid_box: GNodeT =
{
    id: 'box',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Solids,
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
        vec3 $q = abs($coordinates) - $size;
        float $output = length(max($q, 0.0)) + min(max($q.x, max($q.y, $q.z)), 0.0);
    `,
}

const solid_plane: GNodeT =
{
    id: 'plane',
    type: GNodeTemplateTypes.Default,
    category: GNodeTemplateCategories.Solids,
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
    instructionTemplates: glsl`
        float $output = $coordinates.z - $height;
    `,
}

export default [
    solid_sphere,
    solid_torus,
    solid_box,
    solid_plane,
];