
// various: https://iquilezles.org/articles/distfunctions/
// perlin noise: https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83

#DEFINCLUDE inc_union;
Solid inc_union(Solid a, Solid b)
{
    if (a.sd < b.sd) return a;
    else             return b;
}

#DEFINCLUDE inc_intersection;
Solid inc_intersection(Solid a, Solid b)
{
    if (a.sd > b.sd) return a;
    else             return b;
}

#DEFINCLUDE inc_difference;
Solid inc_difference(Solid a, Solid b)
{
    b.sd = -b.sd;
    if (a.sd > b.sd) return a;
    else             return b;
}

#DEFINCLUDE inc_smooth_union;
Solid inc_smooth_union( Solid a, Solid b, float k ) {
    float h = clamp( 0.5 + 0.5*(b.sd-a.sd)/k, 0.0, 1.0 );
    return Solid(mix( b.sd, a.sd, h ) - k*h*(1.0-h), mix(b.color, a.color, h));
}

#DEFINCLUDE inc_smooth_difference;
Solid inc_smooth_difference( Solid a, Solid b, float k ) {
    float h = clamp( 0.5 - 0.5*(a.sd+b.sd)/k, 0.0, 1.0 );
    return Solid(mix( a.sd, -b.sd, h ) + k*h*(1.0-h), mix(a.color, b.color, h));
}

#DEFINCLUDE inc_smooth_intersection;
Solid inc_smooth_intersection( Solid a, Solid b, float k ) {
    float h = clamp( 0.5 - 0.5*(b.sd-a.sd)/k, 0.0, 1.0 );
    return Solid(mix( b.sd, a.sd, h ) + k*h*(1.0-h), mix(b.color, a.color, h));
}

#DEFINCLUDE inc_extrude_z;
Solid inc_extrude_z(vec3 p, Solid s, float h) {
    vec2 w = vec2( s.sd, abs(p.z) - h);
    return Solid(min(max(w.x,w.y),0.0) + length(max(w,0.0)), s.color);
}

// float opRevolution( in vec3 p, in sdf2d primitive, float o )
// {
//     vec2 q = vec2( length(p.xz) - o, p.y );
//     return primitive(q)
// }

#DEFINCLUDE inc_perlin_noise;
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float inc_perlin_noise(vec3 P){
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

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

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

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
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

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
}

#DEFINCLUDE modSelective;

vec3 modSelective(vec3 v, vec3 m) {
    if (m.x > 0.) v.x = mod(v.x, m.x);
    if (m.y > 0.) v.y = mod(v.y, m.y);
    if (m.z > 0.) v.z = mod(v.z, m.z);
    return v;
}

#DEFINCLUDE inc_voronoi;

vec3 inc_voronoi_hash(vec3 p3) {
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}

vec4 inc_voronoi(vec3 x, float scale, float margin) {
    x /= scale;
    vec3 cellPos = floor(x);
    vec3 fracPart = fract(x);
    vec3 outPoint;
    float minDist = 1000.0;

    for (int k = -1; k <= 1; k++)
    for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
        vec3 off = vec3(i, j, k);
        vec3 hash = inc_voronoi_hash(cellPos + off);
        vec3 cellPoint = 0.5 * margin + hash * (1. - margin);
        float currMin = length(cellPoint + off - fracPart);
        if (currMin < minDist) {
            minDist = currMin;
            outPoint = cellPos + cellPoint + off;
        }
    }
    return vec4(scale * outPoint, scale * minDist);
}