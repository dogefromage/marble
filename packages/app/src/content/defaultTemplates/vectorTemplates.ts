import { DataTypes, defaultDataTypeValue } from "../../types";
import { getTemplateId, GNodeTemplate, SpecificRowT } from "../../types/geometries";
import { defaultInputRows } from "../../types/geometries/defaultRows";
import { formatVariable, glsl } from "../../utils/codeStrings";
import { inputField, inputRow, nameRow, outputRow } from "./rowShorthands";
import { TemplateColors } from "./templateConstants";

const vector_3x1: GNodeTemplate = {
    id: getTemplateId('static', 'vector_3x1'),
    version: 0,
    category: 'vectors',
    rows: [
        nameRow('Combine to 3-Vector', TemplateColors.Vectors),
        outputRow('output', 'Combined Vector', 'vec3'),
        inputField('x', 'X', 'float'),
        inputField('y', 'Y', 'float'),
        inputField('z', 'Z', 'float'),
    ],
    instructions: glsl`
        vec3 output = vec3(x, y, z);
    `,
}

const vector_2x1: GNodeTemplate =
{
    id: getTemplateId('static', 'vector_2x1'),
    version: 0,
    category: 'vectors',
    rows: [
        nameRow('Combine to 2-Vector', TemplateColors.Vectors),
        outputRow('output', 'Combined Vector', 'vec2'),
        inputField('x', 'X', 'float'),
        inputField('y', 'Y', 'float'),
    ],
    instructions: glsl`
        vec2 output = vec2(x, y);
    `,
}

const separate_2x1: GNodeTemplate = {
    id: getTemplateId('static', 'separate_2x1'),
    version: 0,
    category: 'vectors',
    rows: [
        nameRow('Separate 2-Vector', TemplateColors.Vectors),
        outputRow('x', 'X', 'float'),
        outputRow('y', 'Y', 'float'),
        inputRow('input', 'Input Vector', 'vec2'),
    ],
    instructions: glsl`
        float x = input.x;
        float y = input.y;
    `,
}

const separate_3x1: GNodeTemplate =
{
    id: getTemplateId('static', 'separate_3x1'),
    version: 0,
    category: 'vectors',
    rows: [
        nameRow('Separate 3-Vector', TemplateColors.Vectors),
        outputRow('x', 'X', 'float'),
        outputRow('y', 'Y', 'float'),
        outputRow('z', 'Z', 'float'),
        inputRow('input', 'Input Vector', 'vec3'),
    ],
    instructions: glsl`
        float x = input.x;
        float y = input.y;
        float z = input.z;
    `,
}

const mirror_plane: GNodeTemplate =
{
    id: getTemplateId('static', 'mirror_plane'),
    version: 0,
    category: 'vectors',
    rows: [
        nameRow('Mirror Point', TemplateColors.Vectors),
        outputRow('output', 'Mirrored', 'vec3'),
        defaultInputRows.position,
        inputField('o', 'Plane Origin', 'vec3'),
        inputField('n', 'Plane Normal', 'vec3', [1, 0, 0]),
    ],
    instructions: glsl`
        vec3 norm = normalize(n);
        float xn = dot(norm, position - o);
        vec3 output = position - norm * (abs(xn) + xn);
    `,
}

const project_plane: GNodeTemplate = {
    id: getTemplateId('static', 'project_plane'),
    version: 0,
    category: 'vectors',
    rows: [
        nameRow('Project on Plane', TemplateColors.Vectors),
        outputRow('output', 'Projected', 'vec3'),
        defaultInputRows.position,
        inputField('o', 'Plane Origin', 'vec3'),
        inputField('n', 'Plane Normal', 'vec3', [1,0,0]),
    ],
    instructions: glsl`
        vec3 norm = normalize(n);
        float xn = dot(norm, position - o);
        vec3 output = position - norm * xn;
    `,
}

const repeat_cell: GNodeTemplate = {
    id: getTemplateId('static', 'repeat_cell'),
    version: 0,
    category: 'vectors',
    rows: [
        nameRow('Repeat Cell', TemplateColors.Vectors),
        outputRow('output', 'Cell Coord', 'vec3'),
        defaultInputRows.position,
        inputField('size', 'Cell Size', 'vec3', [1, 1, 1]),
    ],
    instructions: glsl`
        #INCLUDE modSelective;
        vec3 output = modSelective(position + size * 0.5, size) - size * 0.5;
    `,
}

const transform: GNodeTemplate = {
    id: getTemplateId('static', 'transform'),
    version: 0,
    category: 'vectors',
    rows: [
        nameRow('Transform', TemplateColors.Vectors),
        outputRow('output', 'Output position', 'vec3'),
        outputRow('sd_correction', 'Dist. Correction', 'float'),
        defaultInputRows.position,
        inputField('translation', 'Translation', 'vec3'), {
            id: 'rotation', type: 'rotation',
            dataType: 'mat3', rotationModel: 'xyz',
            name: 'Rotation', value: defaultDataTypeValue['mat3'],
        },
        inputField('scale', 'Scale', 'float', 1),
    ],
    instructions: glsl`
        vec3 output = rotation * (position - translation) / scale;
        float sd_correction = scale;
    `,
}

function unaryOp(
    key: string, name: string,
    inVecId: string,
    outputId: string, outputDataType: DataTypes,
    instructions: string,
) {
    const template: GNodeTemplate = {
        id: getTemplateId('static', key),
        version: 0,
        category: 'vectors',
        rows: [
            nameRow(name, TemplateColors.Vectors),
            outputRow(outputId, formatVariable(outputId), outputDataType) as SpecificRowT,
            inputField(inVecId, formatVariable(inVecId), 'vec3'),
        ],
        instructions,
    }
    return template;
}

const normalize = unaryOp(
    'normalize_vec3', 'Normalize Vector',
    'input', 'unit_vector', 'vec3',
    glsl` vec3 unit_vector = normalize(input); `,
);

const absolute = unaryOp(
    'abs_vec3', 'Absolute Vector',
    'input', 'absolute_vector', 'vec3',
    glsl` vec3 absolute_vector = abs(input); `,
);

const fract = unaryOp(
    'fract_vec3', 'Fractional Part',
    'input', 'fractional_part', 'vec3',
    glsl` vec3 fractional_part = fract(input); `,
);

const floor = unaryOp(
    'floor_vec3', 'Floor Vector',
    'input', 'floored_vector', 'vec3',
    glsl` vec3 floored_vector = floor(input); `,
);

const length = unaryOp(
    'length_vec3', 'Vector Length',
    'input', 'length', 'float',
    glsl` float length = length(input); `,
);

function binaryOp(
    key: string, name: string,
    idA: string, dtA: DataTypes,
    idB: string, dtB: DataTypes,
    idOut: string, dtOut: DataTypes,
    instructions: string,
) {
    const template: GNodeTemplate = {
        id: getTemplateId('static', key),
        version: 0,
        category: 'vectors',
        rows: [
            nameRow(name, TemplateColors.Vectors),
            outputRow(idOut, formatVariable(idOut), dtOut) as SpecificRowT,
            inputField(idA, formatVariable(idA), dtA) as SpecificRowT,
            inputField(idB, formatVariable(idB), dtB) as SpecificRowT,
        ],
        instructions,
    }
    return template;
}

const add = binaryOp(
    'add_vec3', 'Add Vectors',
    'left_vector', 'vec3', 'right_vector', 'vec3', 'sum', 'vec3',
    glsl` vec3 sum = left_vector + right_vector; `,
);

const sub = binaryOp(
    'sub_vec3', 'Subtract Vectors',
    'left_vector', 'vec3', 'right_vector', 'vec3', 'difference', 'vec3',
    glsl` vec3 difference = left_vector - right_vector; `,
);

const mult = binaryOp(
    'mult_vec3', 'Multiply Vectors',
    'left_vector', 'vec3', 'right_vector', 'vec3', 'product', 'vec3',
    glsl` vec3 product = left_vector * right_vector; `,
);

const scale = binaryOp(
    'scale_vec3', 'Scale Vector',
    'vector', 'vec3', 'scalar', 'float', 'scaled', 'vec3',
    glsl` vec3 scaled = vector * scalar; `,
);

const dot_product = binaryOp(
    'dot_product', 'Dot Product',
    'left_vector', 'vec3', 'right_vector', 'vec3', 'dot_product', 'float',
    glsl` float dot_product = dot(left_vector, right_vector); `,
);

const modulo = binaryOp(
    'mod_vec3', 'Vector Modulo',
    'input', 'vec3', 'quotient', 'vec3', 'remainder', 'vec3',
    glsl` vec3 remainder = mod(input, quotient); `,
);

export default [
    // variouts
    mirror_plane, project_plane, repeat_cell, transform,
    // components
    vector_3x1, vector_2x1, separate_3x1, separate_2x1,
    // unary
    normalize, absolute, fract, floor, length,
    // binary
    add, sub, mult, scale, dot_product, modulo,
];