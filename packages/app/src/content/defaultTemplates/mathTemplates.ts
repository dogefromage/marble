import { getTemplateId, GNodeTemplate } from "../../types";
import { glsl } from "../../utils/codeStrings";
import { TemplateColors } from "./templateConstants";

const math_map: GNodeTemplate =
{
    id: getTemplateId('map', 'static'),
    version: 0,
    category: 'math',
    rows: [
        {
            id: 'name',
            type: 'name',
            name: 'Map',
            color: TemplateColors.Operators,
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

export default [
    math_map,
];