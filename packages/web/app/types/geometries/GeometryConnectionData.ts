import { DataTypes } from "../sceneProgram";
import { ObjMap } from "../UtilityTypes";
import { GNodeT, JointLocation } from ".";

export type GeometryNodeRowOrder = Map<string, string[]>; // nodeId -> [ rowId0, rowId1, ... ]
export type GeometryTemplateMap = Map<string, GNodeT>; // nodeId -> template
export type GeometryConnectedRows = Map<string, Set<string>>; // nodeId -> { rowId | row connected }

export type GeometryFromIndices = [ number, number ];
export type GeometryToIndices = [ number, number, number ];

export interface GeometryEdge
{
    id: string;
    fromIndices: GeometryFromIndices;
    toIndices: GeometryToIndices;
    dataType: DataTypes;
}

export type DoubleMap<T> = ObjMap<ObjMap<T>>;
export type GeometryAdjacencyList = DoubleMap<GeometryEdge[]>;

export interface GeometryConnectionData
{
    geometryId: string;
    compilationValidity: number;
    templateMap: GeometryTemplateMap;
    rowOrders: GeometryNodeRowOrder;
    forwardEdges: GeometryAdjacencyList;
    backwardEdges: GeometryAdjacencyList;
    connectedRows: GeometryConnectedRows;
    strayConnectedJoints: JointLocation[];
}