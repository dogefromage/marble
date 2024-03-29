// import { LOOKUP_TEXTURE_WIDTH } from "../../types";
import { glsl } from "../../utils/codeStrings";
import { GLSL_ENCODE_DEPTH, GLSL_RAY_STRUCTURE, GLSL_SCREEN_TO_WORLD } from "./common";

////////////////////////////////// VERTEX SHADER //////////////////////////////////

export const TEXTURE_LOOKUP_METHOD_NAME = 'tx';

export const VERT_CODE_TEMPLATE = glsl`

uniform mat4 cameraWorld;
// uniform vec2 invScreenSize;

out vec3 ray_o;
out vec3 ray_d;
// out vec3 ray_dir_pan_x;
// out vec3 ray_dir_pan_y;

${GLSL_SCREEN_TO_WORLD}

void main() {
    // gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    gl_Position = vec4(position, 1.0);
    ray_o = screenToWorld(vec4(position.xy, -1, 1));
    ray_d = screenToWorld(vec4(position.xy, 1, 1)) - ray_o;

    // vec3 pan = vec3(invScreenSize, 0);
    // ray_dir_pan_x = screenToWorld(vec3(position.xy + pan.xz, 1)) - ray_o - ray_d;
    // ray_dir_pan_y = screenToWorld(vec3(position.xy + pan.zy, 1)) - ray_o - ray_d;
}
`;

////////////////////////////////// FRAGMENT SHADER //////////////////////////////////

export const FRAG_CODE_TEMPLATE = glsl`

uniform sampler2D varTexture;
in vec3 ray_o;
in vec3 ray_d;
// in vec3 ray_dir_pan_x;
// in vec3 ray_dir_pan_y;

uniform vec3 marchParameters;  // vec3(maxDistance, maxIterations, epsilon)
uniform vec3 ambientColor;
uniform vec4 sunGeometry; // vec4(lightDirection.xyz, lightAngle)
uniform vec3 sunColor;

uniform float cameraNear;
uniform float cameraFar;
uniform vec3 cameraDirection;

#define INTERSECTION_STATE_CLEAR 0
#define INTERSECTION_STATE_MAX_ITER 1
#define INTERSECTION_STATE_HIT 2

struct Intersection { 
    int state;
    float t; 
    float penumbra; 
    int iterations; 
    vec3 color; 
};
struct Distance { 
    vec3 color;
    float radius; 
};

${GLSL_RAY_STRUCTURE}

// for perlin_noise
vec4 perlin_permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 perlin_taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 perlin_fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

%MAIN_PROGRAM%

Distance sdf(vec3 p) { 
    return %ROOT_FUNCTION_NAME%(p);
}

vec3 normal(vec3 p) {
    // https://iquilezles.org/articles/normalsSDF/
    float h = 10.0 * marchParameters.z;
    vec2 k = vec2(1,-1);
    return normalize( k.xyy * sdf( p + k.xyy*h ).radius + 
                      k.yyx * sdf( p + k.yyx*h ).radius + 
                      k.yxy * sdf( p + k.yxy*h ).radius + 
                      k.xxx * sdf( p + k.xxx*h ).radius );
}

Intersection march(Ray ray, float clear_distance, int max_iter, float epsilon) {
    int i = 1;
    float t = 0.;
    float penumbra = 1.;
    vec3 last_color = vec3(0,0,0);

    for ( ; i < 10000; i++) {
        if (i >= max_iter) break;

        vec3 p = ray_at(ray, t);
        Distance surface_hit = sdf(p);
        float d = 0.99 * surface_hit.radius;
        last_color = surface_hit.color;

        if (d < epsilon) {
            return Intersection(
                INTERSECTION_STATE_HIT,
                t, penumbra, i, last_color
            );
        }

        if (t > .0) {
            penumbra = min(penumbra, d / t);
        }
        t += d;

        if (t > clear_distance)  {
            return Intersection(
                INTERSECTION_STATE_CLEAR,
                t, penumbra, i, vec3(0,0,0)
            );
        }
    }
    
    return Intersection(
        INTERSECTION_STATE_MAX_ITER,
        t, penumbra, i, last_color
    );
}

${GLSL_ENCODE_DEPTH}

vec4 shade(Ray ray) {
    float clear_distance = marchParameters.x;
    int main_march_iter = int(marchParameters.y);
    float main_march_epsilon = marchParameters.z;

    Intersection main_march = march(
        ray, clear_distance, main_march_iter, main_march_epsilon);

    if (main_march.state == INTERSECTION_STATE_CLEAR) {
        // CLEAR
        // float clearB = 0.95;
        // return vec4(clearB,clearB,clearB, 1);
        return vec4(0,0,0,0);
    }
    
    // HAS HIT or MAX ITER
    gl_FragDepth = encodeDepth(ray.d, main_march.t);

    vec3 p = ray_at(ray, main_march.t);
    vec3 n = normal(p);
    
    float shadow_epsilon = main_march_epsilon * 10.; // play around with this
    vec3 shadow_p_safe = p + 2.0 * shadow_epsilon * n;
    vec3 sun_direction = sunGeometry.xyz;
    Intersection shadow_march = march(
        Ray(shadow_p_safe, sun_direction), clear_distance, main_march_iter, shadow_epsilon);

    vec3 col_lin = ambientColor;
    
    if (shadow_march.state == INTERSECTION_STATE_CLEAR) {
        // in light
        float sun_intensity = 1.3;
        float diffuse_light = max(0.0, dot(sun_direction, n));
        float penumbra_factor = clamp(1.570796 * shadow_march.penumbra / sunGeometry.w, 0., 1.);
        col_lin += sunColor * sun_intensity * diffuse_light * penumbra_factor;
    }
    col_lin *= main_march.color;

    vec3 col_log = pow(col_lin, vec3(1.0 / 2.2)); // crude gamma correction
    return vec4(col_log, 1);
}

// const int AA = 1;

// vec4 render() {
//     if (AA <= 1) {
//         Ray ray = Ray(ray_o, normalize(ray_d));
//         return shade(ray);
//     }
//     float factor = 1.0 / float(AA * AA);
//     vec4 averagePixel;
//     for (int y = 0; y < AA; y++) {
//         for (int x = 0; x < AA; x++) {
//             vec2 uv = 2.0 * vec2(x, y) / float(AA - 1) - 1.0;
//             vec3 dirPan = uv.x * ray_dir_pan_x + uv.y * ray_dir_pan_y;
//             Ray ray = Ray(ray_o, normalize(dirPan + ray_d));
//             vec4 shadingResult = shade(ray);
//             averagePixel += factor * shadingResult;
//         }
//     }
//     return averagePixel;
// }

// vec3 heatmap() {
//     Ray ray = Ray(ray_o, normalize(ray_d));
//     Intersection intersection = march(ray);
//     float x = float(intersection.iterations) / marchParameters.y;
//     float r = min(2. * x, 1.);
//     float b = min(2. - 2. * x, 1.);
//     return vec3(
//         clamp(r, 0., 1.), 
//         0,
//         clamp(b, 0., 1.)
//     );
// }

// vec3 hitTest() {
//     Ray ray = Ray(ray_o, normalize(ray_d));
//     Intersection intersection = march(ray);
//     vec2 col = vec2(1, 0);
//     if (intersection.hasHit) return col.xxx;
//     else                     return col.yyy;
// }

out vec4 outColor;

void main() {
    gl_FragDepth = 1.; // MUST BE SET UNCONDITIONALLY
    Ray ray = Ray(ray_o, normalize(ray_d));
    outColor = shade(ray);
}
`;