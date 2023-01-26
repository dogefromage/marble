import { getTemplateId, GNodeTemplate } from "../../types";
import { glsl } from "../../utils/codeStrings";
import { TemplateColors } from "./templateConstants";

const input_vector_3x1: GNodeTemplate =
{
    id: getTemplateId('vector_3x1', 'static'),
    version: 0,
    category: 'input',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: '3x1 Vector',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'vec3',
            name: 'Combined Vector',
        },
        {
            id: 'x',
            type: 'field',
            name: 'X',
            dataType: 'float',
            value: 0,
        },
        {
            id: 'y',
            type: 'field',
            name: 'Y',
            dataType: 'float',
            value: 0,
        },
        {
            id: 'z',
            type: 'field',
            name: 'Z',
            dataType: 'float',
            value: 0,
        },
    ],
    instructions: glsl`
        vec3 output = vec3(x, y, z);
    `,
}

const input_vector_2x1: GNodeTemplate =
{
    id: getTemplateId('vector_2x1', 'static'),
    version: 0,
    category: 'input',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: '2x1 Vector',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'vec2',
            name: 'Combined Vector',
        },
        {
            id: 'x',
            type: 'field',
            name: 'X',
            dataType: 'float',
            value: 0,
        },
        {
            id: 'y',
            type: 'field',
            name: 'Y',
            dataType: 'float',
            value: 0,
        },
    ],
    instructions: glsl`
        vec2 output = vec2(x, y);
    `,
}

const input_number: GNodeTemplate =
{
    id: getTemplateId('number', 'static'),
    version: 0,
    category: 'input',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Number',
            color: TemplateColors.Operators,
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'float',
            name: 'Vector',
        },
        {
            id: 'input',
            type: 'field',
            name: 'Input',
            dataType: 'float',
            value: 0,
        },
    ],
    instructions: glsl`
        float output = input;
    `,
}

export default [
    input_vector_3x1,
    input_vector_2x1,
    input_number,
];