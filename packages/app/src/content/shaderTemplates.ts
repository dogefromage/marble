import { LOOKUP_TEXTURE_SIZE } from "../utils/viewport/ViewportQuadProgram";
import { glsl } from "../utils/glslTag";

////////////////////////////////// VERTEX SHADER //////////////////////////////////

export const TEXTURE_LOOKUP_METHOD_NAME = 'tx';

export const VERT_CODE_TEMPLATE = glsl`

precision highp float;

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

precision highp float;

uniform sampler2D varSampler;
varying vec3 ray_o;
varying vec3 ray_d;
varying vec3 ray_dir_pan_x;
varying vec3 ray_dir_pan_y;

uniform vec3 marchParameters;  // vec3(maxDistance, maxIterations, epsilon)
uniform vec3 ambientColor;
uniform vec2 ambientOcclusion; // vec2(logisticHalfwayPoint, logisticZero)
uniform vec4 sunGeometry; // vec4(lightDirection.xyz, lightAngle)
uniform vec3 sunColor;

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
    float penumbra;
    int iterations;
    bool hasHit;
    vec3 color;
};

struct Solid
{
    float sd;
    vec3 color;
};

float ${TEXTURE_LOOKUP_METHOD_NAME}(int textureCoordinate)
{
    int y = textureCoordinate / ${LOOKUP_TEXTURE_SIZE};
    int x = textureCoordinate - y * ${LOOKUP_TEXTURE_SIZE};
    vec2 uv = (vec2(x, y) + 0.5) / float(${LOOKUP_TEXTURE_SIZE});
    return texture2D(varSampler, uv).r;
}

%INCLUDES%

%MAIN_PROGRAM%

Solid sdf(vec3 p)
{
    return %ROOT_FUNCTION_NAME%(p);
}

vec3 calcNormal(vec3 p)
{
    // https://iquilezles.org/articles/normalsSDF/
    float h = 10.0 * marchParameters.z;
    vec2 k = vec2(1,-1);
    return normalize( k.xyy * sdf( p + k.xyy*h ).sd + 
                      k.yyx * sdf( p + k.yyx*h ).sd + 
                      k.yxy * sdf( p + k.yxy*h ).sd + 
                      k.xxx * sdf( p + k.xxx*h ).sd );
}

March march(Ray ray)
{
    March march = March(.0, 1.0, 0, false, vec3(0,0,0));

    const int ITERATIONS_HARD_MAX = 10000;

    for (int i = 0; i < ITERATIONS_HARD_MAX; i++)
    {
        if (i >= int(marchParameters.y)) break; // max iterations parameter

        march.iterations = i + 1;

        vec3 p = rayAt(ray, march.t);
        Solid solid = sdf(p);
        float d = 0.99 * solid.sd;

        float minAllowedDist = marchParameters.z;

        if (d < minAllowedDist)
        {
            march.hasHit = true;
            march.color = solid.color;
            return march;
        }

        if (march.t > .0)
        {
            march.penumbra = min(march.penumbra, d / march.t);
        }

        march.t += d;

        if (march.t > marchParameters.x) 
        {
            break;
        }
    }

    return march;
}

// float aoMarch(Ray ray)
// {
//     const int aoIter = 5;
//     float ao = 0.0;
    
//     float t = 0.04;

//     float factor = 0.5;

//     for (int i = 0; i < aoIter; i++)
//     {
//         Solid s = sdf(rayAt(ray, t));
//         if (s.sd <= 0.) break;

//         ao += s.sd / t * factor;
//         factor *= 0.5;

//         t = t * 2.;
//     }

//     float aoFactor = clamp(ao * 1.05, 0., 1.);

//     return 1.0 - (1.0 - aoFactor) * .4;
// }

vec3 shade(Ray ray)
{
    March mainMarch = march(ray);

    if (!mainMarch.hasHit) return vec3(0.85,0.9,1); // clear color

    vec3 p = rayAt(ray, mainMarch.t);
    vec3 n = calcNormal(p);
    vec3 pSafe = p + 2.0 * marchParameters.z * n;

    vec3 sunDir = sunGeometry.xyz;
    March shadowMarch = march(Ray(pSafe, sunDir));

    // float ao = aoMarch(Ray(pSafe, n));
    // vec3 lin = ao * ambientColor;
    vec3 lin = ambientColor;
    
    if (!shadowMarch.hasHit) // in light
    {
        float dotFactor = max(0.0, dot(sunDir, n));
        float penumbraFactor = clamp(1.570796 * shadowMarch.penumbra / sunGeometry.w, 0., 1.);

        lin += sunColor * dotFactor * penumbraFactor;
    }
    else // in shadow
    {
        // float occlusionLogisticExponent = ambientOcclusion.y * (float(mainMarch.iterations) / ambientOcclusion.x - 1.0);
        // float occlusionFactor = 1.0 / (1.0 + exp(occlusionLogisticExponent)); // logistic function
        // lin *= occlusionFactor;
    }

    lin *= mainMarch.color;

    vec3 corrected = pow(lin, vec3(1.0 / 2.2)); // gamma correction
    return corrected;
}

const int AA = 1;

vec3 render()
{
    if (AA <= 1)
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

// vec3 heatmap()
// {
//     Ray ray = Ray(ray_o, normalize(ray_d));
//     March mainMarch = march(ray);

//     float x = float(mainMarch.iterations) / marchParameters.y;

//     float r = min(2. * x, 1.);
//     float b = min(2. - 2. * x, 1.);

//     return vec3(
//         clamp(r, 0., 1.), 
//         0,
//         clamp(b, 0., 1.)
//     );
// }

// vec3 hitTest()
// {
//     Ray ray = Ray(ray_o, normalize(ray_d));
//     March mainMarch = march(ray);

//     vec2 col = vec2(1, 0);

//     if (mainMarch.hasHit) return col.xxx;
    
//     return col.yyy;
// }

void main()
{
    // gl_FragColor = vec4(hitTest(), 1);
    // gl_FragColor = vec4(heatmap(), 1);
    gl_FragColor = vec4(render(), 1);
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