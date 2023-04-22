
#CATEGORY Testing
#COLOR #aa3333

#NAME Box
#DESCRIPTION "Signed distance to a box of double the specified side lengths."
#OUTTYPE float
#ROW p -n Position -rt input-simple
#ROW s -n Size -rt input-variable -dv "{\"x\":1,\"y\":1,\"z\":1}"
#ROW 0 -n Distance -rt output

float sd_box(vec3 p, vec3 s) {
    vec3 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

#NAME Sphere
#DESCRIPTION Sphere.
#OUTTYPE float
#ROW r -n Radius -rt input-variable -dv "1"
#ROW 0 -n Distance -rt output

float sd_sphere(vec3 p, float r) {
    return length(p) - r;
}

#NAME Union
#DESCRIPTION Union.
#COLOR #134568
#OUTTYPE float
#ROW a -n "Distance A" -rt input-simple
#ROW b -n "Distance B" -rt input-simple
#ROW 0 -n "Union" -rt output

float op_union(float a, float b) {
    if (a < b) return a;
    else       return b;
}

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
