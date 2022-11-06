import { ProgramInclude } from "../types";
import { glsl } from "../utils/codeGeneration/glslTag";

const create = (id: string, glslCode: string): ProgramInclude => ({ id, glslCode });

export const inc_union = create('inc_union', glsl`
float inc_union(float a, float b)
{
    return min(a, b);
}
`);

export const inc_transform = create('inc_transform', glsl`
vec3 inc_transform(vec3 x, vec3 translation, mat3 rotation)
{
    // vec3 s = sin(rotation);
    // vec3 c = cos(rotation);

    // mat3 transformation = mat3(
    //     c.y*c.z, s.x*s.y*c.z-c.x*s.z, c.x*s.y*c.z+s.x*s.z,
    //     c.y*s.z, s.x*s.y*s.z+c.x*c.z, c.x*s.y*s.z-s.x*c.z,
    //     -s.y,    s.x*c.y,             c.x*c.y
    // );

    return rotation * (x - translation);
}
`);

export const inc_sdf_sphere = create('inc_sdf_sphere', glsl`
float inc_sdf_sphere(vec3 p, float r)
{
    return length(p) - r;
}
`);

export const inc_sdf_z_plane = create('inc_sdf_z_plane', glsl`
float inc_sdf_z_plane(vec3 p, float h)
{
    return p.z - h;
}
`);

export const inc_sdf_box = create('inc_sdf_box', glsl`
float inc_sdf_box(vec3 p, vec3 b)
{
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}
`);

export const inc_intersection = create('inc_intersection', glsl`
float inc_intersection(float a, float b)
{
    return max(a, b);
}
`);

export const inc_difference = create('inc_difference', glsl`
float inc_difference(float a, float b)
{
    return max(a, -b);
}
`);

// const asdf = create('asdf', glsl`
// `);

const defaultProgramIncludes: ProgramInclude[] = 
[ 
    inc_difference,
    inc_transform,
    inc_union,
    inc_intersection,
    inc_sdf_box,
    inc_sdf_z_plane,
    inc_sdf_sphere,
];

export default defaultProgramIncludes;