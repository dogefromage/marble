import { FlowEditorPanelState } from "../flowEditorView";
import { ViewportPanelState } from "../viewportView";

export interface ViewProps {
    panelId: string;
}

/**
 * Serves also as keys of panels slice in store
 */
export enum ViewTypes {
    FlowEditor = 'flow_editor',
    Viewport = 'viewport',
    Console = 'console',
}

export type PanelStateMap =
{
    [ViewTypes.FlowEditor]: FlowEditorPanelState;
    [ViewTypes.Viewport]: ViewportPanelState;
    [ViewTypes.Console]: {}
}