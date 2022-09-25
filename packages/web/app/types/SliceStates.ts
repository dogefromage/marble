import { GeometryS, SceneProgramTree } from ".";
import { ViewportPanelState } from "./viewport/PanelViewport";
import { KeyValueMap } from "./utils";

export type GeometriesSliceState = KeyValueMap<GeometryS>;

export type ViewportPanelsSliceState = KeyValueMap<ViewportPanelState>;

export type SceneProgramSliceState = 
{
    program: SceneProgramTree | null;
}