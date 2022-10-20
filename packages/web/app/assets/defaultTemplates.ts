import { GNodeT } from "../types";
import template_add from "./templates/TemplateAdd";
import template_difference from "./templates/TemplateDifference";
import template_intersection from "./templates/TemplateIntersection";
import template_n_union from "./templates/TemplateNUnion";
import template_output from "./templates/TemplateOutput";
import template_sdf_cube from "./templates/TemplateSDFCube";
import template_sdf_plane from "./templates/TemplateSDFPlane";
import template_sdf_sphere from "./templates/TemplateSDFSphere";
import template_transform from "./templates/TemplateTransform";
import template_union from "./templates/TemplateUnion";

const defaultTemplates: GNodeT[] = 
[ 
    template_add,
    template_difference,
    template_output,
    template_sdf_cube,
    template_sdf_plane,
    template_sdf_sphere,
    template_transform,
    template_union,
    template_intersection,
    template_n_union,
];

// const defaultTemplatesMap: ObjMap<GNodeT> = Object.fromEntries(templatesList.map(t => [ t.id, t ]));

export default defaultTemplates;