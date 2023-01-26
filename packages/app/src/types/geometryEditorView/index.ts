import { GeometryJointLocation, GeometryJointDirection } from "../geometries";
import { PanelState } from "../panelManager";
import { StaticDataTypes } from "../programs";
import { Point } from "../UtilityTypes";

export interface PlanarCamera {
    position: Point;
    zoom: number;
}

interface TemplateCatalogState {
    offsetPosition: Point;
    worldPosition: Point;
    center: boolean,
}

export interface GeometryNewLink {
    location: GeometryJointLocation;
    direction: GeometryJointDirection;
    dataType: StaticDataTypes;
    offsetPos: Point;
}

export interface GeometryEditorPanelState extends PanelState {
    geometryStack: string[];
    camera: PlanarCamera;
    templateCatalog: TemplateCatalogState | null;
    newLink: GeometryNewLink | null;
}