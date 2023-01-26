import { GeometryJointLocation, GNodeTemplate } from ".";
import { StaticDataTypes } from "../programs";
import { NullArr, ObjMap } from "../UtilityTypes";

export type GeometryFromIndices = [ number, number ];
export type GeometryToIndices = [ number, number, number ];

export interface GeometryEdge {
    id: string;
    fromIndices: GeometryFromIndices;
    toIndices: GeometryToIndices;
    dataType: StaticDataTypes;
}

export type DoubleMap<T> = ObjMap<ObjMap<T>>;
export type GeometryAdjacencyList = DoubleMap<GeometryEdge[]>;

export interface GNodeData {
    template: GNodeTemplate;
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

export interface GeometryConnectionData {
    geometryId: string;
    geometryVersion: number;
    hash: number;
    nodeDatas: NullArr<GNodeData>;
    forwardEdges: GeometryAdjacencyList;
    backwardEdges: GeometryAdjacencyList;
    expiredProps: {
        needsUpdate: boolean;
        strayJoints: GeometryJointLocation[];
        expiredNodeStates: Array<{ nodeIndex: number, template: GNodeTemplate }>;
    }
}