import { vec2 } from "gl-matrix";
import { PlanarCamera } from "../../types";

export function vectorScreenToWorld(camera: PlanarCamera, v: vec2)
{
    return vec2.scale(vec2.create(), v, 1.0 / camera.zoom);
}

export function pointScreenToWorld(camera: PlanarCamera, p: vec2)
{
    const cameraPos = vec2.fromValues(camera.position.x, camera.position.y);
    return vec2.add(cameraPos, cameraPos, vectorScreenToWorld(camera, p));
}