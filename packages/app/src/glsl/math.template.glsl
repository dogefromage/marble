
#CATEGORY Math
#COLOR #34606b

#OUTTYPE float
#ROW 0 -n Output -rt output

#ROW x -n Input -rt input-variable -dv "0"
#ROW from_min -n "From Min" -rt input-variable -dv "0"
#ROW from_max -n "From Max" -rt input-variable -dv "1"
#ROW to_min -n "To Min" -rt input-variable -dv "0"
#ROW to_max -n "To Max" -rt input-variable -dv "1"
#NAME "Map Range"
float math_map(float x, float from_min, float from_max, float to_min, float to_max) {
    float t = (x - from_min) / (from_max - from_min);
    return to_min + t * (to_max - to_min);
}

#NAME "Number Value"
float math_value(float x) {
    return x;
}

#ROW a -n A -rt input-variable -dv "0"
#ROW b -n B -rt input-variable -dv "0"

#NAME "Addition"
float math_addition(float a, float b) {
    return a + b;
}
#NAME "Subtraction"
float math_subtraction(float a, float b) {
    return a - b;
}

#ROW b -n B -rt input-variable -dv "1"

#NAME "Multiplication"
float math_multiplication(float a, float b) {
    return a * b;
}
#NAME "Division"
float math_division(float a, float b) {
    return a / b;
}

#ROW a -n Base -rt input-variable -dv "1"
#ROW b -n Exponent -rt input-variable -dv "0"
#NAME "Power"
float math_power(float a, float b) {
    return pow(a, b);
}

#ROW a -n Base -rt input-variable -dv "1"
#ROW b -n Exponent -rt input-variable -dv "0"
#NAME "Power"
float math_power(float a, float b) {
    return pow(a, b);
}

#ROW x -n Base -rt input-variable -dv "0"

#NAME "Square Root"
float math_sqrt(float x) {
    return sqrt(x);
}

#NAME "Absolute Value"
float math_abs(float x) {
    return abs(x);
}

#NAME "Sine"
float math_sin(float x) {
    return sin(x);
}

#NAME "Cosine"
float math_cos(float x) {
    return cos(x);
}

#NAME "Tangent"
float math_tan(float x) {
    return tan(x);
}

#NAME "Arcsine"
float math_asin(float x) {
    return asin(x);
}

#NAME "Arccosine"
float math_acos(float x) {
    return acos(x);
}

#NAME "Arctangent"
float math_atan(float x) {
    return atan(x);
}
