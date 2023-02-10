import { getTemplateId, GNodeTemplate } from "../../types"
import { defaultOutputRows } from "../../types/geometries/defaultRows"
import { parseTemplateInstructions } from "../../utils/layerPrograms/parsing"
import { inputField, nameRow, outputRow } from "./rowShorthands"
import { TemplateColors } from "./templateConstants"

const sphere: GNodeTemplate = {
    id: getTemplateId('static', 'sphere'),
    version: 0,
    category: 'solids',
    rows: [
        nameRow('Sphere', TemplateColors.Primitives),
        defaultOutputRows['solid'],
        inputField('radius', 'Radius', 'float', 1),
        inputField('color', 'Color', 'vec3', [1,1,1]),
    ],
    instructions: parseTemplateInstructions(`
        Solid:(vec3) sphere(float radius, vec3 color) {
            lambda (vec3 p) : Solid(length(p) - radius, color);
        }
    `),
}

const colorRed: GNodeTemplate = {
    id: getTemplateId('static', 'color_red'),
    version: 0,
    category: 'solids',
    rows: [
        nameRow('Color Red', TemplateColors.Vectors),
        outputRow('red', 'Red Color', 'vec3'),
    ],
    instructions: parseTemplateInstructions(`
        vec3 red() { vec3(1,0,0); }
    `),
}

export default [
    colorRed,
    sphere,
];