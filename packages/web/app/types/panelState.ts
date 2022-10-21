
export type PanelState = {};

export type CreatePanelStateCallback<T extends PanelState = PanelState> = 
    (panelId: string) => T;