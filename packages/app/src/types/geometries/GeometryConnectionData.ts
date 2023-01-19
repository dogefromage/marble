import { GeometryArgument, GeometryJointLocation, GNodeS, GNodeT } from ".";
import { DataTypes } from "../program";
import { NullArr, ObjMap } from "../UtilityTypes";

// export type GeometryNodeRowOrder = Map<string, string[]>; // nodeId -> [ rowId0, rowId1, ... ]
// export type GeometryTemplateMap = Map<string, GNodeT>; // nodeId -> template
// export type GeometryConnectedRows = Map<string, Set<string>>; // nodeId -> { rowId | row connected }
export type GeometryRowHeights = Map<string, number[]>;

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

export interface GeometryArgumentConsumer 
{
    id: string;
    indices: GeometryToIndices;
    argument: GeometryArgument;
}

export interface GNodeData
{
    template: GNodeT;
    /**
     * Def: 
     *  * **Row Heights** := rowHeight[i] = number of height units to go down until the row is reached
     */
    rowHeights: number[];
    /**
     * * **Row Connections** := rowId -> number of connected joints in row
     */
    rowConnections: ObjMap<number>;
}

export interface GeometryConnectionData
{
    geometryId: string;
    geometryVersion: number;
    hash: number;
    nodeDatas: NullArr<GNodeData>;
    forwardEdges: GeometryAdjacencyList;
    backwardEdges: GeometryAdjacencyList;
    dependencies: string[];
    expiredProps: {
        needsUpdate: boolean;
        strayJoints: GeometryJointLocation[];
        expiredNodeStates: Array<{ nodeIndex: number, template: GNodeT }>;
    }
}