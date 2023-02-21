import { parse } from "@shaderfrog/glsl-parser/parser/parser"
import { parse as marbleParse } from "@marble/language"
import { getTemplateId, GNodeTemplate } from "../../types"
import { defaultOutputRows } from "../../types/geometries/defaultRows"
import { glsl } from "../../utils/codeStrings"
import { inputField, inputRow, nameRow, outputRow } from "./rowShorthands"
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
        Distance:(vec3) sphere(float radius, vec3 color) {
            return lambda (vec3 p) : Distance(length(p) - radius, color);
        }
    `,
}

const box: GNodeTemplate = {
    id: getTemplateId('static', 'box'),
    version: 0,
    category: 'solids',
    rows: [
        nameRow('Box', TemplateColors.Primitives),
        defaultOutputRows['surface'],
        inputField('size', 'Size', 'vec3', [1,1,1]),
        inputField('color', 'Color', 'vec3', [1,1,1]),
    ],
    instructions: glsl`
        Distance:(vec3) sphere(float size, vec3 color) {
            return lambda (vec3 p) : {
                vec3 q = abs(p) - size;
                return Distance(length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0), color);
            };
        }
    `,
}

const union: GNodeTemplate = {
    id: getTemplateId('static', 'union'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Union', TemplateColors.SolidOperations),
        defaultOutputRows['surface'],
        inputRow('solid_a', 'Solid A', 'Surface'),
        inputRow('solid_b', 'Solid B', 'Surface'),
    ],
    instructions: glsl`
        #INCLUDE inc_union;
        Distance:(vec3) union(Distance:(vec3) solid_a, Distance:(vec3) solid_b) {
            return lambda (vec3 p) : inc_union(solid_a(p), solid_b(p));
        }
    `,
}

const scale: GNodeTemplate = {
    id: getTemplateId('static', 'scale'),
    version: 0,
    category: 'solid_operators',
    rows: [
        nameRow('Scale', TemplateColors.SolidOperations),
        defaultOutputRows['surface'],
        inputRow('input', 'Surface', 'Surface'),
        inputField('scale', 'Scale', 'float', 1),
    ],
    instructions: glsl`
        Distance:(vec3) union(Distance:(vec3) input, float scale) {
            return lambda (vec3 p) : {
                Distance sd = input((1./scale) * p);
                sd.d *= scale;
                return sd;
            };
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
    box,
    union,
    scale,
];