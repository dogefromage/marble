
#CATEGORY "Space Manipulation"
#COLOR #c46339

// UNARY TEMPLATES
#ROW p -n Position -rt input-simple
#OUTTYPE vec3
#ROW 0 -n Transformed -rt output

#ROW plane_o -n "Plane Origin" -rt input-variable
#ROW plane_n -n "Plane Normal" -rt input-variable -dv "{\"x\":1,\"y\":0,\"z\":0}"
#NAME "Mirror on Plane"
vec3 space_mirror_plane(vec3 p, vec3 plane_o, vec3 plane_n) {
    vec3 norm = normalize(plane_n);
    float xn = dot(norm, p - plane_o);
    return p - norm * (abs(xn) + xn);
}

#NAME "Project onto Plane"
vec3 space_project_plane(vec3 p, vec3 plane_o, vec3 plane_n) {
    vec3 norm = normalize(plane_n);
    float xn = dot(norm, p - plane_o);
    return p - norm * xn;
}


#NAME "Repeat Cell"
#ROW s -n "Cell Size" -rt input-variable -dv "{\"x\":5,\"y\":0,\"z\":0}"
vec3 space_repeat_cell(vec3 p, vec3 s) {
    p += s*0.5;
    if (s.x > 0.) p.x = mod(p.x, s.x);
    if (s.y > 0.) p.y = mod(p.y, s.y);
    if (s.z > 0.) p.z = mod(p.z, s.z);
    return p-s*0.5;
}


#NAME "Repeat Cell"
#ROW s -n "Cell Size" -rt input-variable -dv "{\"x\":5,\"y\":0,\"z\":0}"
vec3 space_repeat_cell(vec3 p, vec3 s) {
    p += s*0.5;
    if (s.x > 0.) p.x = mod(p.x, s.x);
    if (s.y > 0.) p.y = mod(p.y, s.y);
    if (s.z > 0.) p.z = mod(p.z, s.z);
    return p-s*0.5;
}

// { 
//     \"column_1\": { \"x\": 1, \"y\": 0, \"z\": 0 },
//     \"column_2\": { \"x\": 0, \"y\": 1, \"z\": 0 }, 
//     \"column_3\": { \"x\": 0, \"y\": 0, \"z\": 1 } 
// }

#NAME "Transform Space"
#ROW t -n Translation -rt input-variable
#ROW r -n Rotation -rt input-variable -dv "{ \"column_1\": { \"x\": 1, \"y\": 0, \"z\": 0 }, \"column_2\": { \"x\": 0, \"y\": 1, \"z\": 0 }, \"column_3\": { \"x\": 0, \"y\": 0, \"z\": 1 } }"
vec3 space_transform(vec3 p, vec3 t, mat3 r) {
    return r * (p - t);
}


#NAME "Scale Space"
#ROW s -n Scale -rt input-variable -dv "1"
#ROW 1 -n "Distance Correction" -rt output
#OUTTYPE vec3 float
vec3_float space_scale(vec3 p, float s) {
    return vec3_float(p / s, s);
}


#NAME "Correct Distance"
#ROW d -n Distance -rt input-simple
#ROW c -n "Correction Factor" -rt input-variable -dv "1"
#ROW 0 -n "Correct Distance" -rt output
#OUTTYPE Distance
Distance space_correct_distance(Distance d, float c) {
    return Distance(d.color, d.radius * c);
}