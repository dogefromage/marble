import { DataTypes, DataTypeValueTypes } from "../layerPrograms";
import { RotationModels } from "../UtilityTypes";

export type RowTypes = 
    | 'name'
    | 'input'
    | 'input_stacked'
    | 'output'
    | 'field'
    | 'rotation'

interface BaseRowT {
    id: string;
    name: string;
    type: RowTypes;
}

export interface NameRowT extends BaseRowT {
    type: 'name';
    color: string;
}

export interface OutputRowT<D extends DataTypes = DataTypes> extends BaseRowT {
    type: 'output';
    dataType: D;
}

export interface BaseInputRowT<D extends DataTypes = DataTypes, T extends RowTypes = 'input'> extends BaseRowT {
    type: T;
    dataType: D;
    value: DataTypeValueTypes[ D ];
    defaultArgumentToken?: string;
}

export type StackedInputRowT<D extends DataTypes = DataTypes> = BaseInputRowT<D, 'input_stacked'>;

export type FieldRowT<D extends DataTypes = DataTypes> = BaseInputRowT<D, 'field'>;

export interface RotationRowT extends BaseInputRowT<'mat3', 'rotation'> {
    rotationModel: RotationModels;
    currentDisplay?: {
        rotationModel: RotationModels;
        displayValues: number[]
    }
}

export type InputRowT<D extends DataTypes = DataTypes> =
    | BaseInputRowT<D>
    | StackedInputRowT<D>
    | FieldRowT<D>
    | RotationRowT
    

export type RowT<D extends DataTypes = DataTypes> =
    | NameRowT
    | InputRowT<D>
    | OutputRowT<D>

type RowTOverDataTypesMap = {
    [ D in DataTypes ]: RowT<D>;
}
export type SpecificRowT = RowTOverDataTypesMap[DataTypes];

export type GeometryIncomingElementTypes = 'row_output' | 'argument';
export type GeometryIncomingElement =
    | { type: 'row_output', location: GeometryRowLocation }
    | { type: 'argument', argument: string }

export interface BaseRowS {
    incomingElements: GeometryIncomingElement[];
}
export type RowS<T extends RowT = RowT> = Partial<T> & BaseRowS;

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
    dataType: DataTypes;
    mergeStackInput: boolean;
}

export const JOINT_LINK_DND_TAG = 'dnd.geometry.joint.link';
