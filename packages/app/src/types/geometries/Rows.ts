import { splitFirst } from "../../utils/codeStrings";
import { DataTypes, DataTypeValueTypes } from "../layerPrograms";
import { MapEvery, RotationModels } from "../UtilityTypes";

export type RowTypes = 
    | 'name'
    | 'input'
    | 'input_stacked'
    | 'output'
    | 'field'
    | 'rotation'
    | 'color'
    | 'passthrough'
    | 'bezier'

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

export type BezierRowT = BaseInputRowT<'mat3', 'bezier'>;

export interface BaseInputRowT<D extends DataTypes = DataTypes, T extends RowTypes = 'input'> extends BaseRowT {
    type: T;
    dataType: D;
    value: DataTypeValueTypes[ D ];
    defaultParameter?: string;
}

export type StackedInputRowT <D extends DataTypes = DataTypes> = BaseInputRowT<D, 'input_stacked'>;
export type FieldRowT        <D extends DataTypes = DataTypes> = BaseInputRowT<D, 'field'        >;
export type PassthroughRowT  <D extends DataTypes = DataTypes> = BaseInputRowT<D, 'passthrough'  >;

export type ColorRowT = BaseInputRowT<'vec3', 'color'>;

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
    | PassthroughRowT<D>
    | RotationRowT
    | ColorRowT
    | BezierRowT
    
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
    // | { type: 'argument', argument: string }

export type RowDataTypeCombination = `${RowTypes}:${DataTypes}`;
export function getRowDataTypeCombination(rowType: RowTypes, dataType: DataTypes): RowDataTypeCombination {
    return `${rowType}:${dataType}`;
}
export function decomposeRowDataTypeCombination(rowDataTypeCombination: RowDataTypeCombination) {
    const [ rowType, dataType ] = splitFirst(rowDataTypeCombination, ':') as [ RowTypes, DataTypes ];
    return { rowType, dataType };
}

export const allowedInputRows: Partial<MapEvery<RowDataTypeCombination, string>> = {
    'field:float':    'Number Field',
    'field:vec2':     '2-Vector Field', 
    'field:vec3':     '3-Vector Field',
    // 'input:Surface':  'Surface Input',
    'input:float':    'Number Input',
    'input:vec2':     '2-Vector Input',
    'input:vec3':     '3-Vector Input',
    'input:mat3':     '3x3-Matrix Input',
    'rotation:mat3':  'Rotation',
    'color:vec3':     'Color',
};
export const allowedOutputRows: Partial<MapEvery<RowDataTypeCombination, string>> = {
    'output:Surface': 'Surface Output',
    'output:float':   'Number Output',
    'output:vec2':    '2-Vector Output',
    'output:vec3':    '3-Vector Output',
    'output:mat3':    '3x3-Matrix Output',
}
export const allowedInputRowKeys = Object.keys(allowedInputRows) as RowDataTypeCombination[];
export const allowedOutputRowKeys = Object.keys(allowedOutputRows) as RowDataTypeCombination[];

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
    dynamicValue: boolean;
    minWidth: number;
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
