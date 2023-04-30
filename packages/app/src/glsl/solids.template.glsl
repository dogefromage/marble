#CATEGORY Solids
#COLOR #c43959

#ROW p -n Position -rt input-simple
#ROW col -n Color -rt input-variable -dv "{\"x\":1,\"y\":1,\"z\":1}"
#ROW 0 -n Distance -rt output
#OUTTYPE Distance

#NAME "Box"
#DESCRIPTION "Box"
#ROW s -n Size -rt input-variable -dv "{\"x\":1,\"y\":1,\"z\":1}"
Distance sd_box(vec3 p, vec3 s, vec3 col) {
    vec3 q = abs(p) - s;
    return Distance(col, length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0));
}

#NAME "Sphere"
#DESCRIPTION "Sphere"
#ROW r -n Radius -rt input-variable -dv "1"
Distance sd_sphere(vec3 p, float r, vec3 col) {
    return Distance(col, length(p) - r);
}

#NAME "Torus"
#DESCRIPTION "Torus"
#ROW large_r -n Radius -rt input-variable -dv "1"
#ROW small_r -n Thickness -rt input-variable -dv "0.5"
Distance sd_torus(vec3 p, float large_r, float small_r, vec3 col) {
    vec2 q = vec2(length(p.xy) - large_r, p.z);
    return Distance(col, length(q) - small_r);
}

#NAME "Cylinder"
#DESCRIPTION "Cylinder"
#ROW radius -n Radius -rt input-variable -dv "1"
#ROW height -n Height -rt input-variable -dv "1"
Distance sd_cylinder(vec3 p, float radius, float height, vec3 col) {
    vec2 d = abs(vec2(length(p.xy), p.z)) - vec2(radius, height);
    return Distance(col, min(max(d.x,d.y),0.0) + length(max(d,0.0)));
}
