

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
