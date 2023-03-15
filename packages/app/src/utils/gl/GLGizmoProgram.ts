import { ProgramAttribute, ProgramUniform } from "../../types";
import { glsl } from "../codeStrings";
import { globalViewportUniforms } from "../viewportView/uniforms";
import GLIndexedBuffer from "./GLIndexedBuffer";
import GLProgram from "./GLProgram";

const vertCode = glsl`#version 300 es

    precision mediump float;

    in vec3 position;
    uniform mat4 inverseCamera;
    out vec3 ray_o;
    out vec3 ray_d;

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

const fragCode = glsl`#version 300 es
    precision mediump float;

    uniform vec2 invScreenSize;

    uniform vec3 cameraTarget;
    uniform float cameraDistance;

    uniform vec3 cameraDirection;
    uniform float cameraNear;
    uniform float cameraFar;

    in vec3 ray_o;
    in vec3 ray_d;

    struct GridLevel {
        float start_dist;
        float grid_size;
    };

    float line_factor(float coord, float line_width) {
        return 1. - smoothstep(line_width, line_width * 2., abs(coord));
    }

    vec4 xy_axes(vec3 p, float line_width) {
        float line_x_axis = line_factor(p.x, line_width);
        float line_y_axis = line_factor(p.y, line_width);
        vec3 color = vec3(line_x_axis, line_y_axis, 0);
        float alpha = max(line_x_axis, line_y_axis);
        return vec4(color, alpha);
    }

    float xy_grid(vec3 p, float line_width, float grid_size) {
        vec3 m = vec3(grid_size, grid_size, 0); 
        vec3 m_halfs = 0.5 * m;
        vec3 p_zero = mod(p + m_halfs, m) - m_halfs;
        float alpha_x = line_factor(p_zero.x, line_width);
        float alpha_y = line_factor(p_zero.y, line_width);
        return max(alpha_x, alpha_y);
    }

    float stepped_grid(vec3 p, float line_width) {
        
        GridLevel grid_levels[3];
        grid_levels[0] = GridLevel(  0.,   1.);
        grid_levels[1] = GridLevel( 25.,  10.);
        grid_levels[2] = GridLevel(250., 100.);

        float blend_margin_factor = 3.;

        float grid = xy_grid(p, line_width, grid_levels[0].grid_size);

        for (int i = 1; i < 3; i++) {
            GridLevel level = grid_levels[i];
            if (level.start_dist < cameraDistance) {
                float next_grid = xy_grid(p, line_width, level.grid_size);
                float t = smoothstep(
                    level.start_dist, 
                    level.start_dist * blend_margin_factor,
                    cameraDistance
                );
                grid = mix(grid, next_grid, t);
            } else {
                break;
            }
        }

        return grid;
    }

    vec4 coordinate_grid(vec3 p) {
        float line_width = 0.4 * cameraDistance * invScreenSize.y;
        
        vec4 axes = xy_axes(p, line_width);
        float grid = 0.6 * stepped_grid(p, line_width);
        vec3 grid_col = vec3(1,1,1) * 0.3; // gray

        float out_alpha = max(axes.a, grid);
        vec3 out_color = mix(grid_col, axes.rgb, axes.a);

        // falloff
        float distance_target = length(cameraTarget - p);
        float falloff_start = 4. * cameraDistance;
        float falloff_width = falloff_start * 0.1;
        float falloff_factor = smoothstep(falloff_start, falloff_width, distance_target); 

        return vec4(out_color, out_alpha * falloff_factor);
    }


    out vec4 outColor;
    void main() {
        float t = -ray_o.z / ray_d.z;
        if (t < 0. || t > gl_FragDepth) {
            return;
        }
        vec3 p = ray_o + ray_d * t;
        outColor = coordinate_grid(p);

        gl_FragDepth = t;
        // float t_par = dot(ray_d, cameraDirection) * t;
        // gl_FragDepth = (t_par - cameraNear) / (cameraFar - cameraNear);
    }

`;

export default class GLGizmoProgram extends GLProgram {
    constructor(
        gl: WebGL2RenderingContext,
        fullScreenQuad: GLIndexedBuffer,
    ) {
        const uniforms: ProgramUniform[] = [
            globalViewportUniforms.inverseCamera,
            globalViewportUniforms.invScreenSize,
            globalViewportUniforms.cameraTarget,
            globalViewportUniforms.cameraDistance,
            globalViewportUniforms.cameraDirection,
            globalViewportUniforms.cameraNear,
            globalViewportUniforms.cameraFar,
        ];
        const attributes: ProgramAttribute[] = [
            { name: 'position', type: 'vec3' },
        ];
        super(gl, 'gizmo-program', 10, vertCode, fragCode, uniforms, attributes);

        this.bindBuffer('position', fullScreenQuad);
    }
}