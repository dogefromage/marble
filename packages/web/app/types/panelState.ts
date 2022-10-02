import { ObjMap } from "./utils";

export type PanelState = any;

export type PanelStateEnhancerSliceState = ObjMap<PanelState>;

export type CreatePanelStateCallback =
    (panelId: string) => PanelState;