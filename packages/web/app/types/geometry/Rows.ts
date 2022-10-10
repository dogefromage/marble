
/**
 * JOINT
 */

import { DataTypes } from "../sceneProgram";

export const JOINT_DND_TAG = 'dnd.joint';

export type RowValuePair = [ number, number ];
export type RowValueTriple = [ number, number, number ];

export interface RowValueMap 
{
    [DataTypes.Float]: number;
    [DataTypes.Unknown]: number;
    [DataTypes.Vec2]: RowValuePair;
    [DataTypes.Vec3]: RowValueTriple;
}

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
    InputOnly,
    Output,
    Field,
}

export interface AnyRowT
{
    id: string;
    name: string;
}

export interface NameRowT extends AnyRowT
{
    type: RowTypes.Name;
    color: string;
}

export interface AnyInputRowT<D extends DataTypes = DataTypes> extends AnyRowT 
{
    dataType: D;
    value: RowValueMap[D];
    alternativeArg?: string;
}

export interface InputOnlyRowT<D extends DataTypes = DataTypes> extends AnyInputRowT<D>
{
    type: RowTypes.InputOnly;
}

export type AnyInputOnlyRowT = { [T in keyof typeof DataTypes]: InputOnlyRowT<typeof DataTypes[T]> }[keyof typeof DataTypes]

export interface FieldRowT<D extends DataTypes = DataTypes> extends AnyInputRowT<D>
{
    type: RowTypes.Field;
}

export interface OutputRowT<D extends DataTypes = DataTypes> extends AnyRowT
{
    type: RowTypes.Output;
    dataType: D;
}

export type GenericRowT<D extends DataTypes = DataTypes> =
    | NameRowT
    | InputOnlyRowT<D>
    | OutputRowT<D>
    | FieldRowT<D>

type GenericRowTMapped = 
{
    [D in keyof typeof DataTypes]: GenericRowT<typeof DataTypes[D]>;
}
export type RowT = GenericRowTMapped[keyof typeof DataTypes];

export type JointDirection = 'input' | 'output';

export interface JointLocation
{
    nodeId: string;
    rowId: string;
}

export type RowS<T extends RowT | GenericRowT = GenericRowT> = Partial<T> &
{
    connectedOutput?: JointLocation;
    displayConnected?: boolean;
}

export type RowZ<T extends RowT | GenericRowT = GenericRowT> = RowS<T> & T;




export interface RowMetadata
{
    heightUnits: number;
    dynamicValue?: boolean;
}