import { getTemplateId, GNodeTemplate } from "../../types"
import { defaultOutputRows } from "../../types/geometries/defaultRows"
import { parseTemplateInstructions } from "../../utils/layerPrograms/parsing"
import { inputField, nameRow } from "./rowShorthands"
import { TemplateColors } from "./templateConstants"

const sphere: GNodeTemplate = {
    id: getTemplateId('static', 'sphere'),
    version: 0,
    category: 'solids',
    rows: [
        nameRow('Sphere', TemplateColors.Primitives),
        defaultOutputRows['solid'],
        inputField('radius', 'Radius', 'float', 1),
    ],
    instructions: parseTemplateInstructions(`
        float:(vec3) sphere(float size) {
            return lambda (vec3 p) : length(p) - size;
        }
    `),
}

export default [
    sphere,
];