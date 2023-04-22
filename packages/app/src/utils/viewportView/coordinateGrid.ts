import * as THREE from "three";
import { GLSL_ENCODE_DEPTH, GLSL_SCREEN_TO_WORLD } from "../../content/shaders/common";
import { glsl } from "../codeStrings";

const vertCode = glsl`

uniform mat4 cameraWorld;

${GLSL_SCREEN_TO_WORLD}

out vec3 ray_o, ray_d;

void main() {
    gl_Position = vec4(position, 1.0);
    ray_o = screenToWorld(vec4(position.xy, -1, 1));
    ray_d = screenToWorld(vec4(position.xy, 1, 1)) - ray_o;
}
`;

const fragCode = glsl`

uniform vec2 invScreenSize;

uniform vec3 cameraTarget;
uniform float cameraDistance;

uniform vec3 cameraDirection;
uniform float cameraNear, cameraFar;

in vec3 ray_o, ray_d;

struct GridLevel {
    float start_dist;
    float grid_size;
};

float line_factor(float coord, float line_width) {
    return 1. - smoothstep(line_width, line_width * 2., abs(coord));
}

vec4 xy_axes(vec3 p, float line_width) {
    float line_x_axis = line_factor(p.y, line_width);
    float line_y_axis = line_factor(p.x, line_width);
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

float blend_grid_levels(vec3 p, float line_width, GridLevel[8] grid_levels, int level_count) {

    float blend_margin_factor = 3.;

    float grid = xy_grid(p, line_width, grid_levels[0].grid_size);

    for (int i = 1; i < level_count; i++) {
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

float stepped_grid(vec3 p, float line_width) {
    
    GridLevel grid_levels[8];
    int level_count = 3;
    grid_levels[0] = GridLevel(  0.,   1.);
    grid_levels[1] = GridLevel( 25.,  10.);
    grid_levels[2] = GridLevel(250., 100.);

    return blend_grid_levels(p, line_width, grid_levels, level_count);
}

vec4 coordinate_grid(vec3 p) {

    float line_width = invScreenSize.y * 0.18 * cameraDistance;
    
    vec4 axes = xy_axes(p, line_width);
    float is_grid = stepped_grid(p, line_width);
    vec3 grid_col = vec3(1,1,1) * 0.3; // gray

    float out_alpha = max(axes.a, 0.3 * is_grid);
    vec3 out_color = mix(grid_col, axes.rgb, axes.a);

    // falloff
    float distance_target = length(cameraTarget - p);
    float falloff_start = 4. * cameraDistance;
    float falloff_width = falloff_start * 0.1;
    float falloff_factor = smoothstep(falloff_start, falloff_width, distance_target); 

    return vec4(out_color, out_alpha * falloff_factor);
}

${GLSL_ENCODE_DEPTH}

out vec4 outColor;

void main() {
    gl_FragDepth = 1.; // far is default 

    float t = -ray_o.z / ray_d.z;
    if (t < 0.) {
        return; // behind camera
    }

    gl_FragDepth = encodeDepth(ray_d, t);

    vec3 p = ray_o + ray_d * t;
    outColor = coordinate_grid(p);
}
`;

type ShaderMaterialParameters = NonNullable<ConstructorParameters<typeof THREE.ShaderMaterial>[0]>;

export function createCoordinateGrid(fullscreenQuad: THREE.PlaneGeometry, uniformObject: ShaderMaterialParameters['uniforms']) {
    const material = new THREE.ShaderMaterial({
        uniforms: uniformObject,
        vertexShader: vertCode,
        fragmentShader: fragCode,
        glslVersion: THREE.GLSL3,
        transparent: true,
    });
    const mesh = new THREE.Mesh(fullscreenQuad, material);
    mesh.name = `Coordinate Grid`;
    mesh.frustumCulled = false;
    return mesh;
}