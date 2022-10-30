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
vec3 inc_transform(vec3 x, vec3 translate)
{
    return x - translate;
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

export const inc_sdf_cube = create('inc_sdf_cube', glsl`
float inc_sdf_cube(vec3 p, float s)
{
    vec3 b = vec3(s, s, s);
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
    inc_sdf_cube,
    inc_sdf_z_plane,
    inc_sdf_sphere,
];

export default defaultProgramIncludes;