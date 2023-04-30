#CATEGORY Testing

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