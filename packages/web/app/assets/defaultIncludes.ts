import { ProgramInclude } from "../types";
import { glsl } from "../utils/codeGeneration/glslTag";

const create = (id: string, glslCode: string): ProgramInclude => ({ id, glslCode });

export const inc_union = create('inc_union', glsl`
float inc_union(float a, float b)
{
    return min(a, b);
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
    inc_union,
    inc_intersection,
];

export default defaultProgramIncludes;