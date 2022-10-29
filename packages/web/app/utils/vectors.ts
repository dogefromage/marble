import { vec2 } from "gl-matrix";
import { Point } from "../types";

/**
 * Converts Point interface to gl-matrix vec2
 */
export function p2v(point: Point)
{
    return vec2.fromValues(point.x, point.y);
}

/**
 * Converts gl-matrix vec2 to Point interface
 */
export function v2p(v: vec2): Point
{
    return {
        x: v[0],
        y: v[1],
    };
}