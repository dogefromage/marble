import { glsl } from "../utils/gl/glsl";

/////////// VERT ///////////

export const vertexCode = glsl`
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

/////////// FRAG ///////////

export const fragmentCode = glsl`
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

float sdf(vec3 p)
{
    // sphere
    // return length(p) - .5;

    // box
    vec3 b = vec3(1, 1, 1);
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
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
const int MARCH_MAX_ITERATIONS = 100;
const float MARCH_EPSILON = 0.01;

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