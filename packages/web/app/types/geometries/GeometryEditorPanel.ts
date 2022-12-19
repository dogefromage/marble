import { DataTypes, GeometryJointDirection, GeometryJointLocation, PanelState } from "..";
import { Point } from "../UtilityTypes";

export interface PlanarCamera
{
    position: Point;
    zoom: number;
}

export const DEFAULT_PLANAR_CAMERA: PlanarCamera =
{
    position: { x: 0, y: 0 },
    zoom: 1,
}

interface TemplateCatalogState
{
    offsetPosition: Point;
    worldPosition: Point;
    center: boolean,
}

export interface GeometryNewLink
{
    location: GeometryJointLocation;
    direction: GeometryJointDirection;
    dataType: DataTypes;
    offsetPos: Point;
}

export interface GeometryEditorPanelState extends PanelState
{
    geometryId?: string;
    camera: PlanarCamera;
    templateCatalog: TemplateCatalogState | null;
    newLink: GeometryNewLink | null;
}