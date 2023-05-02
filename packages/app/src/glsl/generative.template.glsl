
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


#NAME "Perlin Noise"
#OUTTYPE float
#ROW 0 -n "Noise" -rt output
#ROW p -n "Position" -rt input-simple
#ROW frequency -n "Frequency" -rt input-variable -dv "1"
#ROW amplitude -n "Amplitude" -rt input-variable -dv "1"
float inc_perlin_noise(vec3 p, float frequency, float amplitude){
    vec3 P = p * frequency;
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = perlin_permute(perlin_permute(ix) + iy);
    vec4 ixy0 = perlin_permute(ixy + iz0);
    vec4 ixy1 = perlin_permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = perlin_taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = perlin_taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = perlin_fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz * amplitude;
}
