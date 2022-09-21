import { quat, vec3 } from "gl-matrix";

export interface Camera
{
    position: vec3;
    rotation: quat;
    fov: number;
}

export interface ViewportPanelState
{
    camera: Camera;
}

