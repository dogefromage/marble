import { DataTypes } from "../sceneProgram";
import { ObjMap, RotationModels, Tuple } from "../UtilityTypes";

/**
 * Values
 */

export interface RowValueMap 
{
    [DataTypes.Float]: number;
    [DataTypes.Unknown]: number;
    [DataTypes.Vec2]: Tuple<number, 2>;
    [DataTypes.Vec3]: Tuple<number, 3>;
    [DataTypes.Mat3]: Tuple<number, 9>;
    [DataTypes.Solid]: Tuple<number, 4>;
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
    Name = 'name',
    InputOnly = 'input-only',
    InputStacked = 'input-stacked',
    Output = 'output',
    Field = 'field',
    Rotation = 'rotation',
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

export interface RotationRowT extends SuperInputRowT<DataTypes.Mat3>
{
    type: RowTypes.Rotation;
    rotationModel: RotationModels;
    currentDisplay?: {
        rotationModel: RotationModels;
        displayValues: number[]
    }
}

export interface OutputRowT<D extends DataTypes = DataTypes> extends SuperRowT
{
    type: RowTypes.Output;
    dataType: D;
}

export type RowT<D extends DataTypes = DataTypes> =
    | NameRowT
    | InputOnlyRowT<D>
    | StackedInputRowT<D>
    | OutputRowT<D>
    | FieldRowT<D>
    | RotationRowT

type RowTOverDataTypesMap = 
{
    [D in keyof typeof DataTypes]: RowT<typeof DataTypes[D]>;
}
export type SpecificRowT = RowTOverDataTypesMap[keyof typeof DataTypes];

/**
 * State and Zipped
 */

export type RowS<T extends RowT = RowT> = Partial<T> &
{
    connectedOutputs: RowLocation[];
    displayConnected?: boolean;
}

export type RowZ<T extends RowT = RowT> = RowS<T> & T;

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

export interface RowLocation
{
    nodeId: string;
    rowId: string;
}

export type JointDirection = 'input' | 'output';
export interface JointLocation extends RowLocation
{
    subIndex: number;
}

/**
 * Drag and drop
 */

export const JOINT_DND_TAG = 'dnd.joint';
export interface JointDndTransfer
{
    location: JointLocation;
    direction: JointDirection;
    dataType: DataTypes;
    mergeStackInput: boolean;
}