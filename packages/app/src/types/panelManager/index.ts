import { Rect } from "../UtilityTypes";
import { ViewTypes } from "./views";

export * from './views';

export type PanelState = {
    viewType: ViewTypes;
}

export type CreatePanelStateCallback<T extends PanelState = PanelState> =
    (panelId: string) => T;