
#CATEGORY Vectors
#COLOR #521e47

// unary 
#ROW v -n Input -rt input-simple
#OUTTYPE vec3
#ROW 0 -n Output -rt output

#NAME "vec3 Normalize"
vec3 vec3_normalize(vec3 v) {
    return normalize(v);
}
#NAME "vec3 Abs"
vec3 vec3_abs(vec3 v) {
    return abs(v);
}
#NAME "vec3 Fract"
vec3 vec3_fract(vec3 v) {
    return fract(v);
}
#NAME "vec3 Floor"
vec3 vec3_floor(vec3 v) {
    return floor(v);
}
#NAME "vec3 Length"
vec3 vec3_length(vec3 v) {
    return length(v);
}

// binary with two vectors
#ROW a -n A -rt input-simple
#ROW b -n B -rt input-variable
#ROW 0 -n Output -rt output

#NAME "vec3 Add"
vec3 vec3_add(vec3 a, vec3 b) {
    return a+b;
}

#NAME "vec3 Subtract"
vec3 vec3_sub(vec3 a, vec3 b) {
    return a-b;
}

#NAME "vec3 Multiply"
vec3 vec3_mult(vec3 a, vec3 b) {
    return a*b;
}

#NAME "vec3 Dot"
vec3 vec3_dot(vec3 a, vec3 b) {
    return dot(a,b);
}

#NAME "vec3 Modulo"
#ROW v -n Vector -rt input-simple
#ROW q -n Quotient -rt input-variable
vec3 vec3_dot(vec3 v, vec3 q) {
    return mod(v,q);
}

// binary with two vectors

#NAME "vec3 Scale"
#ROW a -n Vector -rt input-simple
#ROW t -n Scalar -rt input-variable -dv 1
#ROW 0 -n Output -rt output

vec3 vec3_scale(vec3 a, float t) {
    return a*t;
}

// 2D

// unary 
#ROW v -n Input -rt input-simple
#OUTTYPE vec2
#ROW 0 -n Output -rt output

#NAME "vec2 Normalize"
vec2 vec2_normalize(vec2 v) {
    return normalize(v);
}
#NAME "vec2 Abs"
vec2 vec2_abs(vec2 v) {
    return abs(v);
}
#NAME "vec2 Fract"
vec2 vec2_fract(vec2 v) {
    return fract(v);
}
#NAME "vec2 Floor"
vec2 vec2_floor(vec2 v) {
    return floor(v);
}
#NAME "vec2 Length"
vec2 vec2_length(vec2 v) {
    return length(v);
}

// binary with two vectors
#ROW a -n A -rt input-simple
#ROW b -n B -rt input-variable
#ROW 0 -n Output -rt output

#NAME "vec2 Add"
vec2 vec2_add(vec2 a, vec2 b) {
    return a+b;
}

#NAME "vec2 Subtract"
vec2 vec2_sub(vec2 a, vec2 b) {
    return a-b;
}

#NAME "vec2 Multiply"
vec2 vec2_mult(vec2 a, vec2 b) {
    return a*b;
}

#NAME "vec2 Dot"
vec2 vec2_dot(vec2 a, vec2 b) {
    return dot(a,b);
}

#NAME "vec2 Modulo"
#ROW v -n Vector -rt input-simple
#ROW q -n Quotient -rt input-variable
vec2 vec2_dot(vec2 v, vec2 q) {
    return mod(v,q);
}

// binary float

#NAME "vec2 Scale"
#ROW a -n Vector -rt input-simple
#ROW t -n Scalar -rt input-variable -dv 1
#ROW 0 -n Output -rt output

vec2 vec2_scale(vec2 a, float t) {
    return a*t;
}
