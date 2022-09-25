
/**
 * JOINT
 */

import { DataTypes } from "../sceneProgram";

export const JOINT_DND_TAG = 'dnd.joint';

export interface JointDndTransfer extends JointLocation
{
    direction: JointDirection;
}

/**
 * ROWS
 */

export enum RowTypes
{
    Name,
    Input,
    Output,
    Field,
}

export interface BaseRowT
{
    id: string;
    name: string;
}

export interface NameRowT extends BaseRowT
{
    type: RowTypes.Name;
    color: string;
}

export interface InputRowT extends BaseRowT
{
    type: RowTypes.Input;
    dataType: DataTypes;
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
    | FloatFieldRowT;

export type RowT =
    | NameRowT
    | InputRowT
    | OutputRowT
    | FieldRowT

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
