import { vec2 } from "gl-matrix";
import { PlanarCamera, Point } from "../../types";
import { p2v, v2p } from "../linalg";

export function vectorScreenToWorld(camera: PlanarCamera, v: vec2) {
    return vec2.scale(vec2.create(), v, 1.0 / camera.zoom);
}

export function pointScreenToWorld(camera: PlanarCamera, p: vec2): vec2;
export function pointScreenToWorld(camera: PlanarCamera, p: Point): Point;
export function pointScreenToWorld(camera: PlanarCamera, p: any) {
    const isPoint = !Array.isArray(p);
    if (isPoint) {
        p = p2v(p as Point);
    }
    const cameraPos = vec2.fromValues(camera.position.x, camera.position.y);
    const worldVec = vec2.add(cameraPos, cameraPos, vectorScreenToWorld(camera, p));

    return isPoint ? v2p(worldVec) : worldVec;
}