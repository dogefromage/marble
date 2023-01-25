import { quat, vec2, vec3 } from "gl-matrix";
import { PanelState } from "..";

export interface Camera {
    position: vec3;
    rotation: quat;
    fov: number;
}

export interface ViewportCamera {
    target: vec3;
    rotation: vec2;
    distance: number;
    fov: number;
}

export interface ViewportPanelState extends PanelState {
    uniformSources: {
        viewportCamera: ViewportCamera;
        maxIterations: number;
    }
}

