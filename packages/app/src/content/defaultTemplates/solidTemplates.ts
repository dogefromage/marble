import { getTemplateId, GNodeTemplate, SpecificRowT } from "../../types";
import { defaultOutputRows } from "../../types/geometries/defaultRows";
import { glsl } from "../../utils/codeStrings";
import { nameRow, inputField } from "./rowShorthands";
import { templateColors } from "./templateConstants";

const outputRow = defaultOutputRows['surface'];
const colorRow: SpecificRowT = {
    id: 'color',
    type: 'color',
    dataType: 'vec3',
    name: 'Color',
    value: [ 1, 1, 1 ],
}

const solid_sphere: GNodeTemplate = {
    id: getTemplateId('static', 'sphere'),
    version: 0,
    category: 'solids',
    rows: [
        nameRow('Sphere', templateColors['solids']),
        outputRow,
        inputField('radius', 'Radius', 'float', 1),
        colorRow,
    ],
    instructions: glsl`
        Distance:(vec3) sphere(float radius, vec3 color) {
            return lambda (vec3 p) : Distance(length(p) - radius, color);
        }
    `,
}

const solid_torus: GNodeTemplate = {
    id: getTemplateId('static', 'torus'),
    version: 0,
    category: 'solids',
    rows: [
        nameRow('Torus', templateColors['solids']),
        outputRow,
        inputField('large_r', 'R', 'float', 1),
        inputField('small_r', 'r', 'float', 0.5),
        colorRow,
    ],
    instructions: glsl`
        Distance:(vec3) torus(float large_r, float small_r, vec3 color) {
            return lambda (vec3 p) : {
                vec2 q = vec2(length(p.xz) - large_r, p.y);
                return Distance(length(q) - small_r, color);
            };
        }
        // vec2 q = vec2(length(position.xz) - large_r, position.y);
        // Solid output = Solid(length(q) - small_r, color);
    `,
}

const solid_box: GNodeTemplate = {
    id: getTemplateId('static', 'box'),
    version: 0,
    category: 'solids',
    rows: [
        nameRow('Box', templateColors['solids']),
        outputRow,
        inputField('size', 'Size', 'vec3', [1,1,1]),
        colorRow,
    ],
    instructions: glsl`
        Distance:(vec3) box(vec3 size, vec3 color) {
            return lambda (vec3 p) : {
                vec3 q = abs(p) - size;
                return Distance(length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0), color);
            };
        }
        // vec3 q = abs(position) - size;
        // Solid output = Solid(length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0), color);
    `,
}

const solid_cylinder: GNodeTemplate = {
    id: getTemplateId('static', 'cylinder'),
    version: 0,
    category: 'solids',
    rows: [
        nameRow('Cylinder', templateColors['solids']),
        outputRow,
        inputField('height', 'Height', 'float', 1),
        inputField('radius', 'Radius', 'float', 1),
        colorRow,
    ],
    instructions: glsl`
        Distance:(vec3) cylinder(float radius, float height, vec3 color) {
            return lambda (vec3 p) : {
                vec2 d = abs(vec2(length(p.xy), p.z)) - vec2(radius, height);
                return Distance(min(max(d.x,d.y),0.0) + length(max(d,0.0)), color);
            };
        }
        // vec2 d = abs(vec2(length(position.xz), position.y)) - vec2(radius, height);
        // Solid output = Solid(min(max(d.x,d.y),0.0) + length(max(d,0.0)), color);
    `,
}

const solid_plane: GNodeTemplate = {
    id: getTemplateId('static', 'plane'),
    version: 0,
    category: 'solids',
    rows: [
        nameRow('z-Plane', templateColors['solids']),
        outputRow,
        inputField('height', 'Height', 'float', 0),
        colorRow,
    ],
    instructions: glsl`
        Distance:(vec3) plane(float height, vec3 color) {
            return lambda (vec3 p) : Distance(p.z - height, color);
        }
        // Solid output = Solid(position.z - height, color);
    `,
}

export default [
    solid_sphere,
    solid_box,
    solid_torus,
    solid_cylinder,
    solid_plane,
];