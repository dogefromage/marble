import { parse } from "@shaderfrog/glsl-parser/parser/parser"
import { parse as marbleParse } from "@marble/language"
import { getTemplateId, GNodeTemplate } from "../../types"
import { defaultOutputRows } from "../../types/geometries/defaultRows"
import { glsl } from "../../utils/codeStrings"
import { inputField, nameRow, outputRow } from "./rowShorthands"
import { TemplateColors } from "./templateConstants"

const sphere: GNodeTemplate = {
    id: getTemplateId('static', 'sphere'),
    version: 0,
    category: 'solids',
    rows: [
        nameRow('Sphere', TemplateColors.Primitives),
        defaultOutputRows['surface'],
        inputField('radius', 'Radius', 'float', 1),
        inputField('color', 'Color', 'vec3', [1,1,1]),
    ],
    instructions: glsl`
        SignedDistance:(vec3) sphere(float radius, vec3 color) {
            return lambda (vec3 p) : SignedDistance(length(p) - radius, color);
        }
    `,
}

const colorRed: GNodeTemplate = {
    id: getTemplateId('static', 'color_red'),
    version: 0,
    category: 'solids',
    rows: [
        nameRow('Color Red', TemplateColors.Vectors),
        outputRow('red', 'Red Color', 'vec3'),
    ],
    instructions: glsl`
        vec3 red() { 
            return vec3(1,0,0); 
        }
    `,
}


// const testProgram = glsl`
// float test() {
//     vec3 a = mix(1, 2);
// }
// `

// const program = parse(testProgram);
// const program2 = marbleParse(testProgram);

// debugger


export default [
    colorRed,
    sphere,
];