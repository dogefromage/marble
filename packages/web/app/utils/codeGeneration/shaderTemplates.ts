import { LOOKUP_TEXTURE_SIZE } from "../../classes/ViewportQuadProgram";
import { glsl } from "./glslTag";

////////////////////////////////// VERTEX SHADER //////////////////////////////////

export const TEXTURE_LOOKUP_METHOD_NAME = 'lookupTextureVars';

const LIGHT_DIR = `vec3(0.312347, 0.15617376, 0.93704257)`;
const LIGHT_ANGLE = `${ 1.0 * Math.PI / 180.0 }`
const AMBIENT_COLOR = `vec3(0.2, 0.2, 0.2)`;
const AMBIENT_OCCLUSION_HALFWAY = `50.0`;
const AMBIENT_OCCLUSION_ZERO = `5.0`;

const MARCH_MAX_DISTANCE = `1000.0`;
const MARCH_MAX_ITERATIONS = 1000;
const MARCH_EPSILON = 0.00001;

export const VERT_CODE_TEMPLATE = glsl`

precision mediump float;

attribute vec3 position;
uniform mat4 inverseCamera;
uniform vec2 invScreenSize;

varying vec3 ray_o;
varying vec3 ray_d;
varying vec3 ray_dir_pan_x;
varying vec3 ray_dir_pan_y;

vec3 screenToWorld(vec3 x)
{
    vec4 unNorm = inverseCamera * vec4(x, 1);
    return unNorm.xyz / unNorm.w;
}

void main()
{
    gl_Position = vec4(position, 1.0);


    ray_o = screenToWorld(vec3(position.xy, 0));

    vec3 pan = vec3(invScreenSize, 0);

    ray_d = screenToWorld(vec3(position.xy, 1)) - ray_o;
    ray_dir_pan_x = screenToWorld(vec3(position.xy + pan.xz, 1)) - ray_o - ray_d;
    ray_dir_pan_y = screenToWorld(vec3(position.xy + pan.zy, 1)) - ray_o - ray_d;
}
`;



////////////////////////////////// FRAGMENT SHADER //////////////////////////////////

export const FRAG_CODE_TEMPLATE = glsl`

precision mediump float;

uniform sampler2D varSampler;
varying vec3 ray_o;
varying vec3 ray_d;
varying vec3 ray_dir_pan_x;
varying vec3 ray_dir_pan_y;

struct Ray
{
    vec3 o;
    vec3 d;
};
vec3 rayAt(Ray ray, float t)
{
    return ray.o + t * ray.d;
}

struct March
{
    float t;
    float minSineAngle;
    int iterations;
    bool hasHit;
};

float lookupTextureVars(int textureCoordinate)
{
    int y = textureCoordinate / ${LOOKUP_TEXTURE_SIZE};
    int x = textureCoordinate - y * ${LOOKUP_TEXTURE_SIZE};
    
    vec2 uv = (vec2(x, y) + 0.5) / float(${LOOKUP_TEXTURE_SIZE});

    return texture2D(varSampler, uv).r;
}

%INCLUDED_METHODS%

%COMPILED_GEOMETRIES%

float sdf(vec3 p)
{
    %ROOT_GEOMETRY%
}

vec3 calcNormal(vec3 p)
{
    // https://iquilezles.org/articles/normalsSDF/
    const float h = 10.0 * ${MARCH_EPSILON};
    const vec2 k = vec2(1,-1);
    return normalize( k.xyy * sdf( p + k.xyy*h ) + 
                      k.yyx * sdf( p + k.yyx*h ) + 
                      k.yxy * sdf( p + k.yxy*h ) + 
                      k.xxx * sdf( p + k.xxx*h ) );
}

March march(Ray ray)
{
    March march = March(.0, 1.0, 0, false);

    for (int i = 0; i < ${MARCH_MAX_ITERATIONS}; i++)
    {
        march.iterations = i + 1;

        vec3 p = rayAt(ray, march.t);
        float d = sdf(p);

        if (d < ${MARCH_EPSILON})
        {
            march.hasHit = true;
            return march;
        }

        if (march.t > .0)
        {
            march.minSineAngle = min(march.minSineAngle, min(1.0, d / march.t));
        }

        march.t += d;

        if (march.t > ${MARCH_MAX_DISTANCE}) 
        {
            break;
        }
    }

    return march;
}

vec3 shade(Ray ray)
{
    March mainMarch = march(ray);

    if (!mainMarch.hasHit) return vec3(1,1,0.5); // clear color

    vec3 p = rayAt(ray, mainMarch.t);
    vec3 n = calcNormal(p);
    vec3 pSafe = p + 2.0 * ${MARCH_EPSILON} * n;

    vec3 color = ${AMBIENT_COLOR};

    March shadowMarch = march(Ray(pSafe, ${LIGHT_DIR}));

    if (!shadowMarch.hasHit) // in light
    {
        float dotFactor = max(0.0, dot(${LIGHT_DIR}, n));
        float minAngle = asin(shadowMarch.minSineAngle);
        float angleFactor = sqrt(min(1.0, minAngle / ${LIGHT_ANGLE}));

        color += vec3(1, 1, 1) * dotFactor * angleFactor;
    }
    else // in shadow
    {
        float occlusionLogisticExponent = ${AMBIENT_OCCLUSION_ZERO} * (float(mainMarch.iterations) / ${AMBIENT_OCCLUSION_HALFWAY} - 1.0);
        float occlusionFactor = 1.0 / (1.0 + exp(occlusionLogisticExponent)); // logistic function
    
        color *= occlusionFactor;
    }

    return color;
}

const int AA = 5;

vec3 render()
{
    if (AA < 2)
    {
        Ray ray = Ray(ray_o, normalize(ray_d));
        return shade(ray);
    }

    float factor = 1.0 / float(AA * AA);
    vec3 averagePixel;

    for (int y = 0; y < AA; y++)
    {
        for (int x = 0; x < AA; x++)
        {
            vec2 uv = 2.0 * vec2(x, y) / float(AA - 1) - 1.0;
            vec3 dirPan = uv.x * ray_dir_pan_x + uv.y * ray_dir_pan_y;
            Ray ray = Ray(ray_o, normalize(dirPan + ray_d));
            vec3 shadingResult = shade(ray);
            averagePixel += factor * shadingResult;
        }
    }

    return averagePixel;
}

void main()
{
    vec3 pixelColor = render();
    gl_FragColor = vec4(pixelColor, 1);
}
`;

// float sdf(vec3 p)
// {
//     // sphere
//     // return length(p) - 1.;

//     // box
//     // vec3 b = vec3(1, 1, 1);
//     // vec3 q = abs(p) - b;
//     // return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);

//     // torus
//     // vec2 t = vec2(1, 0.5);
//     // vec2 q = vec2(length(p.xz)-t.x,p.y);
//     // return length(q)-t.y;

//     // // wire box
//     // vec3 b = vec3(0.9, 0.8, 0.5);
//     // float e = 0.05;
//     // p = abs(p)-b;
//     // vec3 q = abs(p+e)-e;
//     // return min(min(
//     //     length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
//     //     length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
//     //     length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));

//     // float t = 5.0;
//     // vec3 _p = mod(p + 0.5 * t, t) - 0.5 * t;
//     // vec3 b = vec3(0.8, 0.8, 0.8);
//     // vec3 q = abs(_p) - b;
//     // float box = length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
//     // float sphere = length(_p) - 1.0; 
//     // return max(box, -sphere);
// }