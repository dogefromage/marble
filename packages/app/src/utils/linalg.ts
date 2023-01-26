import { mat3, quat, vec2, vec3 } from "gl-matrix";
import { Point, RotationModels } from "../types";

/**
 * Converts Point interface to gl-matrix vec2
 */
export function p2v(point: Point) {
    return vec2.fromValues(point.x, point.y);
}

/**
 * Converts gl-matrix vec2 to Point interface
 */
export function v2p(v: vec2): Point {
    return {
        x: v[ 0 ],
        y: v[ 1 ],
    };
}

export function eulerToMat3(euler: number[], model: Exclude<RotationModels, 'xyzw'>) {
    const [ sx, sy, sz ] = euler.map(euler => Math.sin(euler));
    const [ cx, cy, cz ] = euler.map(euler => Math.cos(euler));

    // https://glmatrix.net/
    // "column major format"

    const Rx = mat3.transpose(mat3.create(), [
        1, 0, 0,
        0, cx, -sx,
        0, sx, cx,
    ]);

    const Ry = mat3.transpose(mat3.create(), [
        cy, 0, sy,
        0, 1, 0,
        -sy, 0, cy,
    ]);

    const Rz = mat3.transpose(mat3.create(), [
        cz, -sz, 0,
        sz, cz, 0,
        0, 0, 1,
    ]);

    // compose linear map
    const composition = mat3.identity(mat3.create());
    mat3.multiply(composition, Rx, composition);
    mat3.multiply(composition, Ry, composition);
    mat3.multiply(composition, Rz, composition);

    return composition;
}

export function quaternionToEuler(q: quat) {
    // https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles

    const [ x, y, z, w ] = q;

    let roll, pitch, yaw;

    // roll (x-axis rotation)
    const sinr_cosp = 2 * (w * x + y * z);
    const cosr_cosp = 1 - 2 * (x * x + y * y);
    roll = Math.atan2(sinr_cosp, cosr_cosp);

    // pitch (y-axis rotation)
    const sinp = 2 * (w * y - z * x);
    if (Math.abs(sinp) >= 1)
        pitch = Math.PI / 2 * Math.sign(sinp); // use 90 degrees if out of range
    else
        pitch = Math.asin(sinp);

    // yaw (z-axis rotation)
    const siny_cosp = 2 * (w * z + x * y);
    const cosy_cosp = 1 - 2 * (y * y + z * z);
    yaw = Math.atan2(siny_cosp, cosy_cosp);

    return vec3.fromValues(roll, pitch, yaw);
}