import { GLSLSnippet, ObjMap } from "../types";
import { inc_difference } from "./templates/TemplateDifference";
import { inc_sdf_cube } from "./templates/TemplateSDFCube";
import { inc_sdf_z_plane } from "./templates/TemplateSDFPlane";
import { inc_sdf_sphere } from "./templates/TemplateSDFSphere";
import { inc_transform } from "./templates/TemplateTransform";
import { inc_union } from "./templates/TemplateUnion";

const defaultGlslSnippets: GLSLSnippet[] = 
[ 
    inc_difference,
    inc_sdf_cube,
    inc_sdf_z_plane,
    inc_sdf_sphere,
    inc_transform,
    inc_union,
];

// const glslSnippetsMap: ObjMap<GLSLSnippet> = Object.fromEntries(snippetsMap.map(s => [ s.id, s ]));

export default defaultGlslSnippets;