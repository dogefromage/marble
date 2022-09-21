import { GeometryS } from "../../types";
import { ViewportPanelState } from "../../types/viewport/PanelViewport";
import { KeyValueMap } from "../../types/utils";

export type GeometriesSliceState = KeyValueMap<GeometryS>;

export type ViewportPanelsSliceState = KeyValueMap<ViewportPanelState>;