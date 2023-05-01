
#CATEGORY Generative
#COLOR #e39552

#NAME "Voronoi"
#OUTTYPE vec3 vec3 float
#ROW 0 -n "Relative Center" -rt output
#ROW 1 -n "Absolute Center" -rt output
#ROW 2 -n "Distance" -rt output
#ROW x -n "Position" -rt input-simple
#ROW scale -n "Scale" -rt input-variable -dv "1"
#ROW margin -n "Margin" -rt input-variable -dv "0.1"
vec3_vec3_float inc_voronoi(vec3 x, float scale, float margin) {
    vec3 x_s = x / scale;
    vec3 cellPos = floor(x_s);
    vec3 fracPart = fract(x_s);
    vec3 outPoint;
    float minDist = 1000.0;
    for (int k = -1; k <= 1; k++)
    for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
        vec3 off = vec3(i, j, k);
        vec3 hv = cellPos + off;
        hv = fract(hv * vec3(.1031, .1030, .0973));
        hv += dot(hv, hv.yxz+33.33);
        vec3 hash = fract((hv.xxy + hv.yxx)*hv.zyx);
        vec3 cellPoint = 0.5 * margin + hash * (1. - margin);
        float currMin = length(cellPoint + off - fracPart);
        if (currMin < minDist) {
            minDist = currMin;
            outPoint = cellPos + cellPoint + off;
        }
    }
    vec3 abs_center = scale * outPoint;
    return vec3_vec3_float(abs_center - x, abs_center, scale * minDist);
}