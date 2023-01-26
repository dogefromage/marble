import { getTemplateId, GNodeTemplate, SpecificRowT } from "../../types";
import { glsl } from "../../utils/codeStrings";
import { TemplateColors } from "./templateConstants";

const outputRow: SpecificRowT =
{
    id: 'output',
    type: 'output',
    dataType: 'Solid',
    name: 'Solid',
};

const coordinateRow: SpecificRowT =
{
    id: 'coordinates',
    type: 'input',
    name: 'Coordinates',
    dataType: 'vec3',
    value: [ 0, 0, 0 ],
    defaultArgumentToken: 'position',
};

const colorRow: SpecificRowT =
{
    id: 'color',
    type: 'input',
    name: 'Color',
    dataType: 'vec3',
    value: [ 1, 1, 1 ],
};

const solid_sphere: GNodeTemplate =
{
    id: getTemplateId('sphere', 'static'),
    version: 0,
    category: 'solids',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Sphere',
            color: TemplateColors.Primitives,
        },
        outputRow,
        coordinateRow,
        {
            id: 'radius',
            type: 'field',
            dataType: 'float',
            name: 'Radius',
            value: 1,
        },
        colorRow,
    ],
    instructions: glsl`
        Solid output = Solid(length(coordinates) - radius, color);
    `,
}

const solid_torus: GNodeTemplate =
{
    id: getTemplateId('torus', 'static'),
    version: 0,
    category: 'solids',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Torus',
            color: TemplateColors.Primitives,
        },
        outputRow,
        coordinateRow,
        {
            id: 'large_r',
            type: 'field',
            dataType: 'float',
            name: 'R',
            value: 1,
        },
        {
            id: 'small_r',
            type: 'field',
            dataType: 'float',
            name: 'r',
            value: 0.5,
        },
        colorRow,
    ],
    instructions: glsl`
        vec2 q = vec2(length(coordinates.xz) - large_r, coordinates.y);
        Solid output = Solid(length(q) - small_r, color);
    `,
}

const solid_box: GNodeTemplate =
{
    id: getTemplateId('box', 'static'),
    version: 0,
    category: 'solids',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Box',
            color: TemplateColors.Primitives,
        },
        outputRow,
        coordinateRow,
        {
            id: 'size',
            type: 'field',
            dataType: 'vec3',
            name: 'Size',
            value: [ 1, 1, 1 ],
        },
        colorRow,
    ],
    instructions: glsl`
        vec3 q = abs(coordinates) - size;
        Solid output = Solid(length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0), color);
    `,
}

const solid_plane: GNodeTemplate =
{
    id: getTemplateId('plane', 'static'),
    version: 0,
    category: 'solids',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'z-Plane',
            color: TemplateColors.Primitives,
        },
        outputRow,
        coordinateRow,
        {
            id: 'height',
            type: 'field',
            dataType: 'float',
            name: 'Height',
            value: 0,
        },
        colorRow,
    ],
    instructions: glsl`
        Solid output = Solid(coordinates.z - height, color);
    `,
}

const solid_cylinder: GNodeTemplate =
{
    id: getTemplateId('cylinder', 'static'),
    version: 0,
    category: 'solids',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Cylinder',
            color: TemplateColors.Primitives,
        },
        outputRow,
        coordinateRow,
        {
            id: 'height',
            type: 'field',
            dataType: 'float',
            name: 'Height',
            value: 1,
        },
        {
            id: 'radius',
            type: 'field',
            dataType: 'float',
            name: 'Radius',
            value: 1,
        },
        colorRow,
    ],
    instructions: glsl`
        vec2 d = abs(vec2(length(coordinates.xz), coordinates.y)) - vec2(radius, height);
        Solid output = Solid(min(max(d.x,d.y),0.0) + length(max(d,0.0)), color);
    `,
}

export default [
    solid_sphere,
    solid_torus,
    solid_box,
    solid_plane,
    solid_cylinder,
];