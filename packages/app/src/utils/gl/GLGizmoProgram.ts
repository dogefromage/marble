import { ProgramAttribute, ProgramUniform, UniformTypes } from "../../types";
import { glsl } from "../codeStrings";
import { globalViewportUniforms } from "../viewportView/uniforms";
import GLIndexedBuffer from "./GLIndexedBuffer";
import GLProgram from "./GLProgram";

const vertCode = glsl`

    precision mediump float;

    attribute vec3 position;
    uniform mat4 inverseCamera;
    varying vec3 ray_o;
    varying vec3 ray_d;

    vec3 screenToWorld(vec3 x) {
        vec4 unNorm = inverseCamera * vec4(x, 1);
        return unNorm.xyz / unNorm.w;
    }

    void main() {
        gl_Position = vec4(position, 1.0);
        ray_o = screenToWorld(vec3(position.xy, 0));
        ray_d = screenToWorld(vec3(position.xy, 1)) - ray_o;
    }
`;

const fragCode = glsl`

    precision mediump float;

    uniform vec3 cameraTarget;
    uniform float cameraDistance;

    varying vec3 ray_o;
    varying vec3 ray_d;

    float line_factor(float coord, float line_width) {

    }

    vec4 grid() {
        // grid position of ray
        float t = -ray_o.z / ray_d.z;
        if (t < 0.) {
            return vec4(0,0,0,0);
        }
        vec3 p = ray_o + ray_d * t;

        // grid styling
        float grid_size = 1.0;
        float line_width = 0.05;

        // // color
        // vec3 m = vec3(1, 1, 1) * grid_size; 
        // vec3 m_halfs = 0.5 * m;
        // vec3 p_zero = abs(mod(p - m_halfs, m) + m_halfs);
        // float gridFactor = max(p_zero.x, p_zero.y);
        // vec3 color = step(0.0, 1.0, pFract / line_width);

        float line_x = line_factor()        


        // falloff
        float distance_target = length(cameraTarget - p);
        float falloff_start = cameraDistance;
        float falloff_width = cameraDistance * 0.1;
        float intensity = smoothstep(falloff_start, falloff_width, distance_target); 

        return vec4(color, intensity);
    }

    void main() {
        gl_FragColor = grid();
    }

`;

export default class GLGizmoProgram extends GLProgram {
    constructor(
        gl: WebGL2RenderingContext,
        fullScreenQuad: GLIndexedBuffer,
    ) {
        const uniforms: ProgramUniform[] = [
            globalViewportUniforms.inverseCamera,
            globalViewportUniforms.cameraTarget,
            globalViewportUniforms.cameraDistance,
        ];
        const attributes: ProgramAttribute[] = [
            { name: 'position', type: 'vec3' },
        ];
        super(gl, 'gizmo-program', 1000, vertCode, fragCode, uniforms, attributes);

        this.bindBuffer('position', fullScreenQuad);
    }
}