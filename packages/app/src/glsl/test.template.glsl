
# category testing
# color #aa3333

# name Box
float sd_box(vec3 p, vec3 s) {
    vec3 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

# name Sphere
float sd_sphere(vec3 p, float r) {
    return length(p) - r;
}

# name Union
float op_union(float a, float b) {
    if (a < b) return a;
    else       return b;
}
