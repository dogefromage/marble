
#CATEGORY Vectors
#COLOR #521e47

// unary 
#ROW v -n Input -rt input-simple
#OUTTYPE vec3
#ROW 0 -n Output -rt output

#NAME "3-Vector Normalize"
vec3 vec3_normalize(vec3 v) {
    return normalize(v);
}
#NAME "3-Vector Abs"
vec3 vec3_abs(vec3 v) {
    return abs(v);
}
#NAME "3-Vector Fract"
vec3 vec3_fract(vec3 v) {
    return fract(v);
}
#NAME "3-Vector Floor"
vec3 vec3_floor(vec3 v) {
    return floor(v);
}
#NAME "3-Vector Length"
vec3 vec3_length(vec3 v) {
    return length(v);
}

// binary with two vectors
#ROW a -n A -rt input-simple
#ROW b -n B -rt input-variable
#ROW 0 -n Output -rt output

#NAME "3-Vector Add"
vec3 vec3_add(vec3 a, vec3 b) {
    return a+b;
}

#NAME "3-Vector Subtract"
vec3 vec3_sub(vec3 a, vec3 b) {
    return a-b;
}

#NAME "3-Vector Multiply"
vec3 vec3_sub(vec3 a, vec3 b) {
    return a*b;
}

#NAME "3-Vector Dot"
vec3 vec3_dot(vec3 a, vec3 b) {
    return dot(a,b);
}

#NAME "3-Vector Modulo"
#ROW v -n Vector -rt input-simple
#ROW q -n Quotient -rt input-variable
vec3 vec3_dot(vec3 v, vec3 q) {
    return mod(v,q);
}

// binary with two vectors

#NAME "3-Vector Scale"
#ROW a -n Vector -rt input-simple
#ROW t -n Scalar -rt input-variable -dv 1
#ROW 0 -n Output -rt output

vec3 vec3_scale(vec3 a, float t) {
    return a*t;
}
