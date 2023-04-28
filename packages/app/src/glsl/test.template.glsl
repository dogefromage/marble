


///////////////// SOLIDS /////////////////

#CATEGORY Solids
#COLOR #aa3333

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



#CATEGORY "Solid Operations"
#COLOR #134568
#OUTTYPE Distance
#ROW a -n "Distance A" -rt input-simple
#ROW b -n "Distance B" -rt input-simple
#ROW k -n "Smoothing" -rt input-variable -dv "0.5"
#ROW 0 -n "Combined Distance" -rt output

#NAME Union
Distance op_union(Distance a, Distance b) {
    if (a.radius < b.radius) return a;
    else                     return b;
}

#NAME Intersection
Distance op_intersection(Distance a, Distance b) {
    if (a.radius > b.radius) return a;
    else                     return b;
}

#NAME Difference
Distance op_difference(Distance a, Distance b) {
    b.radius = -b.radius;
    if (a.radius > b.radius) return a;
    else                     return b;
}

#NAME "Smooth Union"
Distance op_smooth_union( Distance a, Distance b, float k ) {
    float h = clamp( 0.5 + 0.5*(b.radius-a.radius)/k, 0.0, 1.0 );
    float rad = mix( b.radius, a.radius, h ) - k*h*(1.0-h);
    vec3 col = mix(b.color, a.color, h);
    return Distance(col, rad);
}

#NAME "Smooth Difference"
Distance op_smooth_difference( Distance a, Distance b, float k ) {
    float h = clamp( 0.5 - 0.5*(a.radius+b.radius)/k, 0.0, 1.0 );
    float rad = mix( a.radius, -b.radius, h ) + k*h*(1.0-h);
    vec3 col = mix(a.color, b.color, h);
    return Distance(col, rad);
}

#NAME "Smooth Intersection"
Distance op_smooth_intersection( Distance a, Distance b, float k ) {
    float h = clamp( 0.5 - 0.5*(b.radius-a.radius)/k, 0.0, 1.0 );
    float rad = mix( b.radius, a.radius, h ) + k*h*(1.0-h);
    vec3 col = mix(b.color, a.color, h);
    return Distance(col, rad);
}






#CATEGORY Other

#NAME Separate XYZ
#DESCRIPTION XYZ.
#COLOR #561343
#OUTTYPE float float float
#ROW v -n "Vector" -rt input-simple
#ROW 0 -n "X" -rt output
#ROW 1 -n "Y" -rt output
#ROW 2 -n "Z" -rt output

float_float_float separate_xyz(vec3 v) {
    return float_float_float(
        v.x, v.y, v.z
    );
}



#NAME Test Node
#DESCRIPTION adfasd.
#COLOR #123456
#OUTTYPE float
#ROW 0 -n "X" -rt output

float testNode() {
    return 0.;
}