import { ViewTypes } from "./view";

export type PanelState = 
{
    viewType: ViewTypes;
};

export type CreatePanelStateCallback<T extends PanelState = PanelState> = 
    (panelId: string) => T;