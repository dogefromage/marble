import { DataTypes, DefaultFunctionArgNames, GNodeT, GNodeTemplateCategories, GNodeTemplateTypes, RowTypes, SpecificRowT } from "../../types"
import { glsl } from "../../utils/glslTag"
import { TemplateColors } from "./templateConstants"

const outputRow: SpecificRowT = 
{
    id: 'output',
    type: RowTypes.Output,
    dataType: DataTypes.Solid,
    name: 'Solid',
};

const coordinateRow: SpecificRowT = 
{
    id: 'coordinates',
    type: RowTypes.InputOnly,
    name: 'Coordinates',
    dataType: DataTypes.Vec3,
    value: [ 0, 0, 0 ],
    defaultArgumentToken: DefaultFunctionArgNames.RayPosition,
};

const colorRow: SpecificRowT = 
{
    id: 'color',
    type: RowTypes.InputOnly,
    name: 'Color',
    dataType: DataTypes.Vec3,
    value: [ 1, 1, 1 ],
};

const solid_sphere: GNodeT =
{
    id: 'sphere',
    version: 0,
    type: GNodeTemplateTypes.Base,
    category: GNodeTemplateCategories.Solids,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Sphere',
            color: TemplateColors.Primitives,
        },
        outputRow,
        coordinateRow,
        {
            id: 'radius',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Radius',
            value: 1,
        },
        colorRow,
    ],
    instructionTemplates: glsl`
        Solid $output = Solid(length($coordinates) - $radius, $color);
    `,
}

const solid_torus: GNodeT =
{
    id: 'torus',
    version: 0,
    type: GNodeTemplateTypes.Base,
    category: GNodeTemplateCategories.Solids,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Torus',
            color: TemplateColors.Primitives,
        },
        outputRow,
        coordinateRow,
        {
            id: 'large_r',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'R',
            value: 1,
        },
        {
            id: 'small_r',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'r',
            value: 0.5,
        },
        colorRow,
    ],
    instructionTemplates: glsl`
        vec2 $q = vec2(length($coordinates.xz) - $large_r, $coordinates.y);
        Solid $output = Solid(length($q) - $small_r, $color);
    `,
}

const solid_box: GNodeT =
{
    id: 'box',
    version: 0,
    type: GNodeTemplateTypes.Base,
    category: GNodeTemplateCategories.Solids,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Box',
            color: TemplateColors.Primitives,
        },
        outputRow,
        coordinateRow,
        {
            id: 'size',
            type: RowTypes.Field,
            dataType: DataTypes.Vec3,
            name: 'Size',
            value: [ 1, 1, 1 ],
        },
        colorRow,
    ],
    instructionTemplates: glsl`
        vec3 q = abs(coordinates) - size;
        Solid output = Solid(length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0), color);
    `,
}

const solid_plane: GNodeT =
{
    id: 'plane',
    version: 0,
    type: GNodeTemplateTypes.Base,
    category: GNodeTemplateCategories.Solids,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'z-Plane',
            color: TemplateColors.Primitives,
        },
        outputRow,
        coordinateRow,
        {
            id: 'height',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Height',
            value: 0,
        },
        colorRow,
    ],
    instructionTemplates: glsl`
        Solid $output = Solid($coordinates.z - $height, $color);
    `,
}

const solid_cylinder: GNodeT =
{
    id: 'cylinder',
    version: 0,
    type: GNodeTemplateTypes.Base,
    category: GNodeTemplateCategories.Solids,
    rows: [
        {
            id: 'name',
            type: RowTypes.Name,
            name: 'Cylinder',
            color: TemplateColors.Primitives,
        },
        outputRow,
        coordinateRow,
        {
            id: 'height',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Height',
            value: 1,
        },
        {
            id: 'radius',
            type: RowTypes.Field,
            dataType: DataTypes.Float,
            name: 'Radius',
            value: 1,
        },
        colorRow,
    ],
    instructionTemplates: glsl`
        vec2 $d = abs(vec2(length($coordinates.xz), $coordinates.y)) - vec2($radius, $height);
        Solid $output = Solid(min(max($d.x,$d.y),0.0) + length(max($d,0.0)), $color);
    `,
}

export default [
    solid_sphere,
    solid_torus,
    solid_box,
    solid_plane,
    solid_cylinder,
];