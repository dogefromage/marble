import { Rect } from "../UtilityTypes";
import { ViewTypes } from "./views";

export * from './views';

export interface ActivePanel {
    panelId: string;
    panelClientRect: Rect;
}

export type PanelState = {
    viewType: ViewTypes;
}

export type CreatePanelStateCallback<T extends PanelState = PanelState> =
    (panelId: string) => T;