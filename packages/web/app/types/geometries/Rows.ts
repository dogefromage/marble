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

interface SuperRowT
{
    id: string;
    name: string;
}

interface SuperInputRowT<D extends DataTypes = DataTypes> extends SuperRowT 
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

export interface NameRowT extends SuperRowT
{
    type: RowTypes.Name;
    color: string;
}

export interface InputOnlyRowT<D extends DataTypes = DataTypes> extends SuperInputRowT<D>
{
    type: RowTypes.InputOnly;
}

export interface StackedInputRowT<D extends DataTypes = DataTypes> extends SuperInputRowT<D>
{
    type: RowTypes.InputStacked;
}

export type AnyInputOnlyRowT = { [T in keyof typeof DataTypes]: InputOnlyRowT<typeof DataTypes[T]> }[keyof typeof DataTypes]

export interface FieldRowT<D extends DataTypes = DataTypes> extends SuperInputRowT<D>
{
    type: RowTypes.Field;
}

export interface OutputRowT<D extends DataTypes = DataTypes> extends SuperRowT
{
    type: RowTypes.Output;
    dataType: D;
}

/**
 * Generic template types
 */

export type EveryRowT<D extends DataTypes = DataTypes> =
    | NameRowT
    | InputOnlyRowT<D>
    | StackedInputRowT<D>
    | OutputRowT<D>
    | FieldRowT<D>

type GenericRowTMapped = 
{
    [D in keyof typeof DataTypes]: EveryRowT<typeof DataTypes[D]>;
}
export type RowT = GenericRowTMapped[keyof typeof DataTypes];

/**
 * State and Zipped
 */

export type RowS<T extends RowT | EveryRowT = EveryRowT> = Partial<T> &
{
    connectedOutputs: JointLocation[];
    // displayConnected?: boolean;
}

export type RowZ<T extends RowT | EveryRowT = EveryRowT> = RowS<T> & T;

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
    subIndex: number;
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