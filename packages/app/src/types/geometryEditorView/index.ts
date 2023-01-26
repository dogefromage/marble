import { GeometryJointLocation, GeometryJointDirection } from "../geometries";
import { PanelState } from "../panelManager";
import { DataTypes } from "../layerPrograms";
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
    dataType: DataTypes;
    offsetPos: Point;
}

export interface GeometryEditorPanelState extends PanelState {
    geometryStack: string[];
    camera: PlanarCamera;
    templateCatalog: TemplateCatalogState | null;
    newLink: GeometryNewLink | null;
}