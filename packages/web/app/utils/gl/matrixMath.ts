import { mat4, quat, vec3 } from "gl-matrix";
import { Camera } from "../../types/viewport/PanelViewport";


export function createTransformationMatrix(position: vec3, rotation: quat)
{
    return mat4.fromRotationTranslation(
        mat4.create(),
        rotation,
        position,
    );
}

export function createCameraWorldToScreen(camera: Camera, aspect: number)
{
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
    const near = 0.1;
    const far = 10;

    const f = 1.0 / Math.tan(camera.fov / 2);
    const rangeInv = 1 / (near - far);

    const cameraPerspective = mat4.fromValues(
        f / aspect, 0,                          0,   0,
        0,          f,                          0,   0,
        0,          0,    (near + far) * rangeInv,  -1,
        0,          0,  2 * near * far * rangeInv,   0
    );

    const transform = createTransformationMatrix(camera.position, camera.rotation);
    const inverseTransform = mat4.invert(mat4.create(), transform);

    const worldToScreen = mat4.multiply(mat4.create(), cameraPerspective, inverseTransform);

    return worldToScreen;
}