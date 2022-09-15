import { GeometryS } from "../../types/Geometry";
import { ViewportPanelState } from "../../types/PanelViewport";
import { KeyValueMap } from "../../types/utils";

export type GeometriesSliceState = KeyValueMap<GeometryS>;

export type ViewportPanelsSliceState = KeyValueMap<ViewportPanelState>;