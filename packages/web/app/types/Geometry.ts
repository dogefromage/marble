
/**
 * JOINT
 */

import { vec2 } from "gl-matrix";
import { Override, Point } from "./utils";

export const JOINT_DND_TAG = 'dnd.joint';

export interface JointDndTransfer extends JointLocation
{
    direction: JointDirection;
}


/**
 * ROWS
 */

export enum DataTypes
{
    Unknown = 'unknown',
    Float = 'float',
}

export enum RowTypes
{
    Name,
    Field,
    Output,
}

export interface BaseRowT
{
    id: string;
    name: string;
}

export interface NameRowT extends BaseRowT
{
    type: RowTypes.Name;
}

export interface OutputRowT extends BaseRowT
{
    type: RowTypes.Output;
    dataType: DataTypes;
}

export interface FloatFieldRowT extends BaseRowT
{
    type: RowTypes.Field,
    dataType: DataTypes.Float;
    value: number;
}

export type FieldRowT =
    |  FloatFieldRowT;

export type RowT = 
    | NameRowT
    | FieldRowT
    | OutputRowT

export type JointDirection = 'input' | 'output';

export interface JointLocation
{
    nodeId: string;
    rowId: string;
}

export type RowS<T extends RowT = RowT> = Partial<T> &
{
    connectedOutput?: JointLocation;
}

export type RowZ<T extends RowT = RowT> = RowS & T;

/**
 * NODE
 */

export enum GNodeTypes
{
    Recursive,
    Default,
}

export interface GNodeT
{
    id: string;
    type: GNodeTypes;
    rows: Array<RowT>;
}

export interface GNodeS
{
    id: string;
    templateId: string;
    position: Point;
    rows: {
        [ rowId: string ]: RowS;
    }
}

export type GNodeZ = Override<GNodeS & GNodeT, 'rows',  Array<RowZ>>;

/**
 * GEOMETRY
 */

export interface GeometryS
{
    id: string;
    name: string;
    nodes: Array<GNodeS>;
    outputId?: string;
    validity: number;
    nextIdIndex: number;
}

export type GeometryZ = Override<GeometryS, 'nodes', Array<GNodeZ>>;
