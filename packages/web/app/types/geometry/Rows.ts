
/**
 * JOINT
 */

import { DataTypes } from "../sceneProgram";

export const JOINT_DND_TAG = 'dnd.joint';

export type RowValue = number | number[];

export interface JointDndTransfer extends JointLocation
{
    direction: JointDirection;
    dataType: DataTypes;
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

export interface BaseInputRowT<D extends DataTypes = DataTypes> extends BaseRowT 
{
    dataType: D;
    value: RowValue;
    alternativeArg?: string;
}

export interface NameRowT extends BaseRowT
{
    type: RowTypes.Name;
    color: string;
}

export interface InputRowT extends BaseInputRowT
{
    type: RowTypes.Input;
    dataType: DataTypes;
}

export interface FloatFieldRowT extends BaseInputRowT<DataTypes.Float>
{
    type: RowTypes.Field;
}

export interface OutputRowT extends BaseRowT
{
    type: RowTypes.Output;
    dataType: DataTypes;
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
