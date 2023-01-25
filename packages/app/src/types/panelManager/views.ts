import { GeometryEditorPanelState } from "../geometryEditorView";
import { ViewportPanelState } from "../viewportView";

export interface ViewProps {
    panelId: string;
}

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