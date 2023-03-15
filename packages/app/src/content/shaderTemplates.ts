import { LOOKUP_TEXTURE_WIDTH } from "../types";
import { glsl } from "../utils/codeStrings";

////////////////////////////////// VERTEX SHADER //////////////////////////////////

export const TEXTURE_LOOKUP_METHOD_NAME = 'tx';

export const VERT_CODE_TEMPLATE = glsl`#version 300 es

precision highp float;

in vec3 position;
uniform mat4 inverseCamera;
uniform vec2 invScreenSize;

out vec3 ray_o;
out vec3 ray_d;
out vec3 ray_dir_pan_x;
out vec3 ray_dir_pan_y;

vec3 screenToWorld(vec3 x) {
    vec4 unNorm = inverseCamera * vec4(x, 1);
    return unNorm.xyz / unNorm.w;
}

void main() {
    gl_Position = vec4(position, 1.0);
    ray_o = screenToWorld(vec3(position.xy, 0));
    ray_d = screenToWorld(vec3(position.xy, 1)) - ray_o;

    vec3 pan = vec3(invScreenSize, 0);

    ray_dir_pan_x = screenToWorld(vec3(position.xy + pan.xz, 1)) - ray_o - ray_d;
    ray_dir_pan_y = screenToWorld(vec3(position.xy + pan.zy, 1)) - ray_o - ray_d;
}
`;

////////////////////////////////// FRAGMENT SHADER //////////////////////////////////

export const FRAG_CODE_TEMPLATE = glsl`#version 300 es

precision highp float;

uniform sampler2D varSampler;
in vec3 ray_o;
in vec3 ray_d;
in vec3 ray_dir_pan_x;
in vec3 ray_dir_pan_y;

uniform vec3 marchParameters;  // vec3(maxDistance, maxIterations, epsilon)
uniform vec3 ambientColor;
// uniform vec2 ambientOcclusion; // vec2(logisticHalfwayPoint, logisticZero)
uniform vec4 sunGeometry; // vec4(lightDirection.xyz, lightAngle)
uniform vec3 sunColor;

uniform vec3 cameraDirection;
uniform float cameraNear;
uniform float cameraFar;

struct Ray {
    vec3 o;
    vec3 d;
};
vec3 rayAt(Ray ray, float t) {
    return ray.o + t * ray.d;
}

struct Intersection {
    float t;
    float penumbra;
    int iterations;
    bool hasHit;
    vec3 color;
};

struct Distance {
    float d;
    vec3 color;
};

float ${TEXTURE_LOOKUP_METHOD_NAME}(int textureCoordinate)
{
    int y = textureCoordinate / ${LOOKUP_TEXTURE_WIDTH};
    int x = textureCoordinate - y * ${LOOKUP_TEXTURE_WIDTH};
    vec2 uv = (vec2(x, y) + 0.5) / float(${LOOKUP_TEXTURE_WIDTH});
    return texture(varSampler, uv).r;
}

%INCLUDES%

%MAIN_PROGRAM%

Distance sdf(vec3 p)
{
    return %ROOT_FUNCTION_NAME%(p);
}

vec3 calcNormal(vec3 p) {
    // https://iquilezles.org/articles/normalsSDF/
    float h = 10.0 * marchParameters.z;
    vec2 k = vec2(1,-1);
    return normalize( k.xyy * sdf( p + k.xyy*h ).d + 
                      k.yyx * sdf( p + k.yyx*h ).d + 
                      k.yxy * sdf( p + k.yxy*h ).d + 
                      k.xxx * sdf( p + k.xxx*h ).d );
}

Intersection march(Ray ray) {
    Intersection intersection = Intersection(.0, 1.0, 0, false, vec3(0,0,0));
    for (int i = 0; i < 10000; i++) {
        if (i >= int(marchParameters.y)) break; // max iterations parameter
        intersection.iterations = i + 1;

        vec3 p = rayAt(ray, intersection.t);
        Distance sd = sdf(p);
        float d = 0.99 * sd.d;

        float minAllowedDist = marchParameters.z;

        if (d < minAllowedDist) {
            intersection.hasHit = true;
            intersection.color = sd.color;
            return intersection;
        }

        if (intersection.t > .0) {
            intersection.penumbra = min(intersection.penumbra, d / intersection.t);
        }

        intersection.t += d;
        if (intersection.t > marchParameters.x)  {
            break;
        }
    }
    return intersection;
}

float encodeZDepth(float z_depth) {
    float n = cameraNear, 
          f = cameraFar;
    float z_clip = (f+n + 2.*f*n/z_depth) / (f-n); // [ n, f ] -> [ -1, 1 ]
    return 0.5 * (z_clip - 1.); // map into [ 0, 1 ]
}

vec4 shade(Ray ray) {
    Intersection mainIntersection = march(ray);
    if (!mainIntersection.hasHit) return vec4(0,0, 0, 0);

    float z_depth = abs(dot(ray.d, cameraDirection)) * mainIntersection.t;
    gl_FragDepth = encodeZDepth(z_depth);

    vec3 p = rayAt(ray, mainIntersection.t);
    vec3 n = calcNormal(p);
    vec3 pSafe = p + 2.0 * marchParameters.z * n;

    vec3 sunDir = sunGeometry.xyz;
    Intersection shadowIntersection = march(Ray(pSafe, sunDir));

    vec3 lin = ambientColor;
    
    if (!shadowIntersection.hasHit) {
        // in light
        float dotFactor = max(0.0, dot(sunDir, n));
        float penumbraFactor = clamp(1.570796 * shadowIntersection.penumbra / sunGeometry.w, 0., 1.);
        lin += sunColor * dotFactor * penumbraFactor;
    }
    lin *= mainIntersection.color;

    vec3 corrected = pow(lin, vec3(1.0 / 2.2)); // gamma correction
    return vec4(corrected, 1);
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
    // gl_FragColor = vec4(hitTest(), 1);
    // gl_FragColor = vec4(heatmap(), 1);

    gl_FragDepth = -1.;

    Ray ray = Ray(ray_o, normalize(ray_d));
    outColor = shade(ray);

    // SHOW DEPTH
    float b = gl_FragDepth * 50.;
    outColor = vec4(b,b,b,1);
}
`;