import { glsl } from "../../utils/codeStrings";

export const GLSL_ENCODE_DEPTH = glsl`
float encodeDepth(vec3 ray_direction, float ray_t) {
    float orthogonal_depth = cameraNear + dot(ray_direction, cameraDirection) * ray_t;
    float n = cameraNear, 
          f = cameraFar;
    float ndc = (f+n - 2.*f*n / orthogonal_depth) / (f-n); // [ n, f ] -> [ -1, 1 ]
    return 0.5 * (ndc + 1.); // map into [ 0, 1 ]
}
`;

export const GLSL_SCREEN_TO_WORLD = glsl`
vec3 screenToWorld(vec4 x) {
    vec4 unNorm = cameraWorld * inverse(projectionMatrix) * x;
    return unNorm.xyz / unNorm.w;
}
`;