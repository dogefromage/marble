import { GeometryEditorPanelState } from "../geometries"
import { ViewportPanelState } from "../viewport";

/**
 * Serves also as keys of panels slice in store
 */
export enum ViewTypes
{
    GeometryEditor = 'geometryEditor',
    Viewport = 'viewport',
    Console = 'console',
}

export type PanelStateMap =
{
    [ViewTypes.GeometryEditor]: GeometryEditorPanelState;
    [ViewTypes.Viewport]: ViewportPanelState;
    [ViewTypes.Console]: {}
}