import { Point } from "../utils";

export interface PlanarCamera
{
    position: Point;
    zoom: number;
}

export const DEFAULT_PLANAR_CAMERA: PlanarCamera =
{
    position: { x: 0, y: 0 },
    zoom: 1,
}

export interface GeometryEditorPanelState
{
    camera: PlanarCamera;
}