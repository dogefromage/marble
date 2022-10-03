import { glsl } from "./glslTag";

////////////////////////////////// VERTEX SHADER //////////////////////////////////

export const VERT_CODE_TEMPLATE = glsl`

precision mediump float;

attribute vec3 position;
uniform mat4 inverseCamera;
varying vec3 ray_o;
varying vec3 ray_d;

vec3 screenToWorld(vec3 x)
{
    vec4 unNorm = inverseCamera * vec4(x, 1);
    return unNorm.xyz / unNorm.w;
}

void main()
{
    gl_Position = vec4(position, 1.0);

    ray_o = screenToWorld(vec3(position.xy, 0));
    ray_d = screenToWorld(vec3(position.xy, 1)) - ray_o;
}
`;



////////////////////////////////// FRAGMENT SHADER //////////////////////////////////

export const FRAG_CODE_TEMPLATE = glsl`

precision mediump float;

struct Ray
{
    vec3 o;
    vec3 d;
};

vec3 rayAt(Ray ray, float t)
{
    return ray.o + t * ray.d;
}

float inc_sdf_sphere(vec3 p, float r)
{
    return length(p) - r;
}

float inc_sdf_cube(vec3 p, float s)
{
    vec3 b = vec3(s, s, s);
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float inc_union(float a, float b)
{
    return min(a, b);
}

float inc_difference(float a, float b)
{
    return max(a, -b);
}

float inc_sdf_z_plane(vec3 p, float h)
{
    return p.z - h;
}

vec3 inc_transform(vec3 x, vec3 translate)
{
    return x + translate;
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
    const float h = 0.0001;
    const vec2 k = vec2(1,-1);
    return normalize( k.xyy * sdf( p + k.xyy*h ) + 
                      k.yyx * sdf( p + k.yyx*h ) + 
                      k.yxy * sdf( p + k.yxy*h ) + 
                      k.xxx * sdf( p + k.xxx*h ) );
}

const float MARCH_MAX_DISTANCE = 1000.0;
const int MARCH_MAX_ITERATIONS = 1000;
const float MARCH_EPSILON = 0.00001;

float march(Ray ray)
{
    float t = .0;

    for (int i = 0; i < MARCH_MAX_ITERATIONS; i++)
    {
        vec3 p = rayAt(ray, t);
        float d = sdf(p);

        if (d < MARCH_EPSILON) return t;

        t += d;

        if (t > MARCH_MAX_DISTANCE) return t;
    }

    return MARCH_MAX_DISTANCE;
}

vec3 render(Ray ray)
{
    float t = march(ray);

    if (t > 0.99 * MARCH_MAX_DISTANCE)
    {
        return vec3(1,1,1);
    }

    vec3 p = rayAt(ray, t);
    vec3 n = calcNormal(p);

    vec3 light = normalize(vec3(1, -0.5, 3));

    float diffuse = max(0.0, dot(light, n));

    return vec3(diffuse, diffuse, diffuse);
}

varying vec3 ray_o;
varying vec3 ray_d;

void main()
{
    Ray ray = Ray(ray_o, normalize(ray_d));
    vec3 pixelColor = render(ray);
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