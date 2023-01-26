import { getTemplateId, GNodeTemplate } from "../../types/geometries"
import { glsl } from "../../utils/codeStrings"
import { MAT3_IDENTITY, TemplateColors } from "./templateConstants"

const vectors_mirror_plane: GNodeTemplate =
{
    id: getTemplateId('mirror_plane', 'static'),
    version: 0,
    category: 'vectors',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Mirror on Plane',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'vec3',
            name: 'Mirrored',
        },
        {
            id: 'x',
            type: 'input_only',
            dataType: 'vec3',
            defaultArgumentToken: 'position',
            value: [ 0, 0, 0 ],
            name: 'Coordinate',
        },
        {
            id: 'o',
            type: 'field',
            dataType: 'vec3',
            value: [ 0, 0, 0 ],
            name: 'Plane Origin',
        },
        {
            id: 'n',
            type: 'field',
            dataType: 'vec3',
            value: [ 1, 0, 0 ],
            name: 'Plane Normal',
        }
    ],
    instructions: glsl`
        // TODO replace with householder matrix
        vec3 norm = normalize(n);
        float xn = dot(norm, x - o);
        vec3 output = x - norm * (abs(xn) + xn); // mirror if dot negative, nothing if positive
    `,
}

const vectors_repeat_cell: GNodeTemplate =
{
    id: getTemplateId('repeat_cell', 'static'),
    version: 0,
    category: 'vectors',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Repeat Cell',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'vec3',
            name: 'Cell Coord',
        },
        {
            id: 'x',
            type: 'input_only',
            dataType: 'vec3',
            defaultArgumentToken: 'position',
            value: [ 0, 0, 0 ],
            name: 'Coordinate',
        },
        {
            id: 'size',
            type: 'field',
            dataType: 'vec3',
            value: [ 1, 1, 1 ],
            name: 'Cell Size',
        },
    ],
    instructions: glsl`
        vec3 output = mod(x + size*0.5, size) - size*0.5;
    `,
}

const vectors_transform: GNodeTemplate =
{
    id: getTemplateId('transform', 'static'),
    version: 0,
    category: 'vectors',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Transform',
            color: '#123456',
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'vec3',
            name: 'Output Pos',
        },
        {
            id: 'sd_correction',
            type: 'output',
            dataType: 'float',
            name: 'SD Correction',
        },
        {
            id: 'input',
            type: 'input_only',
            dataType: 'vec3',
            name: 'Input Pos',
            value: [ 0, 0, 0 ],
            defaultArgumentToken: 'position',
        },
        {
            id: 'translation',
            type: 'field',
            dataType: 'vec3',
            name: 'Translation',
            value: [ 0, 0, 0 ],
        },
        {
            id: 'rotation',
            type: 'rotation',
            dataType: 'mat3',
            rotationModel: 'xyz',
            name: 'Rotation',
            value: MAT3_IDENTITY,
        },
        {
            id: 'scale',
            type: 'field',
            dataType: 'float',
            name: 'Scale',
            value: 1,
        }
    ],
    instructions: glsl`
        vec3 output = rotation * (input - translation) / scale;
        float sd_correction = scale;
    `,
}

const vectors_separate_3x1: GNodeTemplate =
{
    id: getTemplateId('separate_3x1', 'static'),
    version: 0,
    category: 'vectors',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Separate XYZ',
            color: '#123456',
        },
        {
            id: 'x',
            type: 'output',
            dataType: 'float',
            name: 'X',
        },
        {
            id: 'y',
            type: 'output',
            dataType: 'float',
            name: 'Y',
        },
        {
            id: 'z',
            type: 'output',
            dataType: 'float',
            name: 'Z',
        },
        {
            id: 'input',
            type: 'input_only',
            dataType: 'vec3',
            name: 'Input Vector',
            value: [ 0, 0, 0 ],
        },
    ],
    instructions: glsl`
        float x = input.x;
        float y = input.y;
        float z = input.z;
    `,
}

const vectors_separate_2x1: GNodeTemplate =
{
    id: getTemplateId('separate_2x1', 'static'),
    version: 0,
    category: 'vectors',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Separate XY',
            color: '#123456',
        },
        {
            id: 'x',
            type: 'output',
            dataType: 'float',
            name: 'X',
        },
        {
            id: 'y',
            type: 'output',
            dataType: 'float',
            name: 'Y',
        },
        {
            id: 'input',
            type: 'input_only',
            dataType: 'vec2',
            name: 'Input Vector',
            value: [ 0, 0 ],
        },
    ],
    instructions: glsl`
        float x = input.x;
        float y = input.y;
    `,
}

export default [
    vectors_mirror_plane,
    vectors_repeat_cell,
    vectors_transform,
    vectors_separate_3x1,
    vectors_separate_2x1,
];