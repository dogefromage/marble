import { getTemplateId, GNodeTemplate } from "../../types";
import { glsl } from "../../utils/codeStrings";
import { inputRow, nameRow, outputRow } from "./rowShorthands";
import { TemplateColors } from "./templateConstants";

const math_number_value: GNodeTemplate =
{
    id: getTemplateId('static', 'number'),
    version: 0,
    category: 'math',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Number Value',
            color: TemplateColors.SolidOperations,
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

const math_map: GNodeTemplate =
{
    id: getTemplateId('static', 'map'),
    version: 0,
    category: 'math',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Map',
            color: TemplateColors.SolidOperations,
        },
        {
            id: 'output',
            type: 'output',
            dataType: 'float',
            name: 'Map',
        },
        {
            id: 'input',
            type: 'field',
            name: 'Input',
            dataType: 'float',
            value: 0,
        },
        {
            id: 'from_min',
            type: 'field',
            name: 'From Min',
            dataType: 'float',
            value: 0,
        },
        {
            id: 'from_max',
            type: 'field',
            name: 'From Max',
            dataType: 'float',
            value: 1,
        },
        {
            id: 'to_min',
            type: 'field',
            name: 'To Min',
            dataType: 'float',
            value: 0,
        },
        {
            id: 'to_max',
            type: 'field',
            name: 'To Max',
            dataType: 'float',
            value: 1,
        },
    ],
    instructions: glsl`
        float t = (input - from_min) / (from_max - from_min);
        float output = to_min + t * (to_max - to_min);
    `,
}

const evaluate_bezier: GNodeTemplate =
{
    id: getTemplateId('static', 'evaluate_bezier'),
    version: 0,
    category: 'math',
    rows: [
        nameRow('Evaluate Bezier'),
        outputRow('y', 'y-Value', 'float'), 
        {
            id: 'bezier',
            name: 'Bezier Curve',
            type: 'bezier',
            dataType: 'mat3',
            value: [ 0, 0, 0.2, 0.7, 0.6, 0.4, 1, 0.7, 0 ],
        },
        inputRow('x', 'x-Value', 'float'),
    ],
    instructions: glsl`
        float y = x;
    `,
}

export default [
    math_number_value,
    math_map,
    evaluate_bezier,
];