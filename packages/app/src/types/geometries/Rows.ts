import { DataTypes } from "../program";
import { RotationModels, Tuple } from "../UtilityTypes";

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

export interface SuperInputRowT<D extends DataTypes = DataTypes> extends SuperRowT 
{
    dataType: D;
    value: RowValueMap[D];
    defaultArgumentToken?: string;
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

export enum GeometryIncomingElementTypes {
    RowOutput = 'row-output',
    Argument = 'argument',
}
export type GeometryIncomingElement = 
    | { type: GeometryIncomingElementTypes.RowOutput, location: GeometryRowLocation }
    | { type: GeometryIncomingElementTypes.Argument, argument: GeometryArgument }

export interface SuperRowS {
    incomingElements: GeometryIncomingElement[];
}
export type RowS<T extends RowT = RowT> = Partial<T> & SuperRowS;

export type RowZ<T extends RowT = RowT> = Partial<RowS<T>> & T & {
    numConnectedJoints: number;
};

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
export type GeometryJointDirection = 'input' | 'output';
export interface GeometryRowLocation {
    nodeId: string;
    rowId: string;
}
export interface GeometryJointLocation extends GeometryRowLocation {
    subIndex: number;
}

/**
 * Arguments
 */
export interface GeometryArgument
{
    identifier: string;
    dataType: DataTypes;
}


/**
 * Drag and drop
 */
export interface JointLinkDndTransfer 
{
    location: GeometryJointLocation;
    direction: GeometryJointDirection;
    dataType: DataTypes;
    mergeStackInput: boolean;
}

export interface JointArgumentDndTransfer 
{
    argument: GeometryArgument;
}

export const JOINT_LINK_DND_TAG = 'dnd.geometry.joint.link';
export const JOINT_ARGUMENT_DND_TAG = 'dnd.geometry.joint.arg';
