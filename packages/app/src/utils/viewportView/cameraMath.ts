import { Euler, Quaternion } from "three";
import { ViewportCamera } from "../../types";

// // Blender default cube camera
// camera: {
//     position: vec3.fromValues(7.358, -6.925, 4.958),
//     rotation: quat.fromValues(0.483536, 0.208704, 0.336872, 0.780483),
//     fov: degToRad(25),
// },

export function getViewportRotation(viewportCamera: ViewportCamera) {
    
    const rotationQuat = new Quaternion().setFromEuler(
        new Euler(
            viewportCamera.rotation[0] + 0.5 * Math.PI,
            0,
            viewportCamera.rotation[1],
            'ZYX',
        ));
    return rotationQuat;

    // const alpha = viewportCamera.rotation[0];
    // const beta = viewportCamera.rotation[1];

    // const cameraRotation = quat.fromEuler(
    //     quat.create(),
    //     90 + alpha,
    //     0,
    //     beta,
    // );

    // const cameraDir = vec3.transformQuat(vec3.create(), vec3.fromValues(0, 0, -1), cameraRotation);

    // return { cameraDir, cameraRotation }
}

// export function viewportCameraToNormalCamera(viewportCamera: ViewportCamera) {
//     const { cameraDir, cameraRotation } = getViewportRotation(viewportCamera);

//     const cameraPosMinusTarget = vec3.scale(vec3.create(), cameraDir, -1 * viewportCamera.distance);
//     const cameraPos = vec3.add(vec3.create(), cameraPosMinusTarget, viewportCamera.target);

//     const camera: RenderCamera = {
//         position: cameraPos,
//         rotation: cameraRotation,
//         fov: viewportCamera.fov,
//         direction: cameraDir,
//     }

//     return camera;
// }

// export function createTransformationMatrix(position: vec3, rotation: quat) {
//     return mat4.fromRotationTranslation(
//         mat4.create(),
//         rotation,
//         position,
//     );
// }

// export function createCameraWorldToScreen(camera: RenderCamera, aspect: number, near: number, far: number) {
//     // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection

//     const f = 1.0 / Math.tan(camera.fov / 2);
//     const rangeInv = 1 / (near - far);

//     const cameraPerspective = mat4.fromValues(
//         f / aspect, 0, 0, 0,
//         0, f, 0, 0,
//         0, 0, (near + far) * rangeInv, -1,
//         0, 0, 2 * near * far * rangeInv, 0
//     );

//     const transform = createTransformationMatrix(camera.position, camera.rotation);
//     const inverseTransform = mat4.invert(mat4.create(), transform);
//     const worldToScreen = mat4.multiply(mat4.create(), cameraPerspective, inverseTransform);
//     return worldToScreen;
// }
