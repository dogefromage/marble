import { DataTypes } from "../sceneProgram";

/**
 * Values
 */

export interface RowValueMap 
{
    [DataTypes.Float]: number;
    [DataTypes.Unknown]: number;
    [DataTypes.Vec2]: [ number, number ];
    [DataTypes.Vec3]: [ number, number, number ];
}

/**
 * super interfaces
 */

export interface AnyRowT
{
    id: string;
    name: string;
}

export interface AnyInputCompatibleRowT<D extends DataTypes = DataTypes> extends AnyRowT 
{
    dataType: D;
    value: RowValueMap[D];
    alternativeArg?: string;
}

/**
 * Diverse rows
 */

export enum RowTypes
{
    Name,
    InputOnly,
    InputStacked,
    Output,
    Field,
}

export interface NameRowT extends AnyRowT
{
    type: RowTypes.Name;
    color: string;
}

export interface InputOnlyRowT<D extends DataTypes = DataTypes> extends AnyInputCompatibleRowT<D>
{
    type: RowTypes.InputOnly;
}

export interface StackedInputRowT<D extends DataTypes = DataTypes> extends AnyInputCompatibleRowT<D>
{
    type: RowTypes.InputStacked;
}

export type AnyInputOnlyRowT = { [T in keyof typeof DataTypes]: InputOnlyRowT<typeof DataTypes[T]> }[keyof typeof DataTypes]

export interface FieldRowT<D extends DataTypes = DataTypes> extends AnyInputCompatibleRowT<D>
{
    type: RowTypes.Field;
}

export interface OutputRowT<D extends DataTypes = DataTypes> extends AnyRowT
{
    type: RowTypes.Output;
    dataType: D;
}

/**
 * Generic template types
 */

export type GenericRowT<D extends DataTypes = DataTypes> =
    | NameRowT
    | InputOnlyRowT<D>
    | StackedInputRowT<D>
    | OutputRowT<D>
    | FieldRowT<D>

type GenericRowTMapped = 
{
    [D in keyof typeof DataTypes]: GenericRowT<typeof DataTypes[D]>;
}
export type RowT = GenericRowTMapped[keyof typeof DataTypes];

/**
 * State and Zipped
 */

export type RowS<T extends RowT | GenericRowT = GenericRowT> = Partial<T> &
{
    connectedOutput?: JointLocation;
    displayConnected?: boolean;
}

export type RowZ<T extends RowT | GenericRowT = GenericRowT> = RowS<T> & T;

/**
 * Metadata
 */

export interface RowMetadata
{
    heightUnits: number;
    dynamicValue?: boolean;
}

/**
 * Locating
 */

export type JointDirection = 'input' | 'output';
export interface JointLocation
{
    nodeId: string;
    rowId: string;
}

/**
 * Drag and drop
 */

export const JOINT_DND_TAG = 'dnd.joint';
export interface JointDndTransfer extends JointLocation
{
    direction: JointDirection;
    dataType: DataTypes;
}