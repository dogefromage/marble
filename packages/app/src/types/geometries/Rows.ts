import { StaticDataTypes } from "../programs";
import { RotationModels, Tuple } from "../UtilityTypes";
import { DefaultArgumentIds, GeometryArgument } from "./Geometry";

export type RowTypes = 
    | 'name'
    | 'input_only'
    | 'input_stacked'
    | 'output'
    | 'field'
    | 'rotation'

export interface RowValueMap {
    unknown: number;
    float:   number;
    vec2:    Tuple<number, 2>;
    vec3:    Tuple<number, 3>;
    mat3:    Tuple<number, 9>;
    Solid:   Tuple<number, 4>;
}

interface SuperRowT {
    id: string;
    name: string;
    type: RowTypes;
}

export interface SuperInputRowT<D extends StaticDataTypes = StaticDataTypes> extends SuperRowT {
    dataType: D;
    value: RowValueMap[ D ];
    defaultArgumentToken?: string;
}

/**
 * Diverse rows
 */


export interface NameRowT extends SuperRowT {
    type: 'name';
    color: string;
}

export interface InputOnlyRowT<D extends StaticDataTypes = StaticDataTypes> extends SuperInputRowT<D> {
    type: 'input_only';
}

export interface StackedInputRowT<D extends StaticDataTypes = StaticDataTypes> extends SuperInputRowT<D> {
    type: 'input_stacked';
}

export interface FieldRowT<D extends StaticDataTypes = StaticDataTypes> extends SuperInputRowT<D> {
    type: 'field';
}

export interface RotationRowT extends SuperInputRowT<'mat3'> {
    type: 'rotation';
    rotationModel: RotationModels;
    currentDisplay?: {
        rotationModel: RotationModels;
        displayValues: number[]
    }
}

export interface OutputRowT<D extends StaticDataTypes = StaticDataTypes> extends SuperRowT {
    type: 'output';
    dataType: D;
}

export type RowT<D extends StaticDataTypes = StaticDataTypes> =
    | NameRowT
    | InputOnlyRowT<D>
    | StackedInputRowT<D>
    | OutputRowT<D>
    | FieldRowT<D>
    | RotationRowT

type RowTOverDataTypesMap = {
    [ D in StaticDataTypes ]: RowT<D>;
}
export type SpecificRowT = RowTOverDataTypesMap[StaticDataTypes];

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
export interface RowMetadata {
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
 * Drag and drop
 */
export interface JointLinkDndTransfer {
    location: GeometryJointLocation;
    direction: GeometryJointDirection;
    dataType: StaticDataTypes;
    mergeStackInput: boolean;
}

export interface JointArgumentDndTransfer {
    argument: GeometryArgument;
}

export const JOINT_LINK_DND_TAG = 'dnd.geometry.joint.link';
export const JOINT_ARGUMENT_DND_TAG = 'dnd.geometry.joint.arg';
