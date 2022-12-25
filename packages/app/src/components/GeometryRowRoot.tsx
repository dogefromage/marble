import React from 'react';
import { FieldRowT, InputOnlyRowT, NameRowT, OutputRowT, RotationRowT, RowMetadata, RowS, RowT, RowTypes, RowZ, StackedInputRowT } from '../types';
import GeometryRowField, { getRowMetadataField } from './GeometryRowField';
import GeometryRowInputOnly from './GeometryRowInputOnly';
import GeometryRowInputStacked, { getRowMetadataStackedInput } from './GeometryRowInputStacked';
import GeometryRowName from './GeometryRowName';
import GeometryRowOutput from './GeometryRowOutput';
import GeometryRowRotation, { getRowMetadataRotation } from './GeometryRowRotation';

export type RowMetaProps<T extends RowT = RowT> = 
{
    template: T | RowZ<T>;
    state: RowS<T> | RowZ<T>;
    numConnectedJoints: number;
};
// export type RowMetaProps<T extends RowT = RowT> = RowZ<T>;

export function rowMeta(heightUnits = 1, dynamicValue = false): RowMetadata
{
    return { heightUnits, dynamicValue };
}

export function getRowMetadata(props: RowMetaProps): RowMetadata
{
    if (props.template.type === RowTypes.Field)
        return getRowMetadataField(props as RowMetaProps<FieldRowT>);
    if (props.template.type === RowTypes.Rotation)
        return getRowMetadataRotation(props as RowMetaProps<RotationRowT>);
    if (props.template.type === RowTypes.InputStacked)
        return getRowMetadataStackedInput(props as RowMetaProps<StackedInputRowT>);
    

    return rowMeta();
}

export type RowProps<T extends RowT = RowT> =
{
    geometryId: string;
    panelId: string;
    nodeId: string;
    row: RowZ<T>;
}

const GeometryRowRoot = (props: RowProps) =>
{
    if (props.row.type === RowTypes.Name)
        return <GeometryRowName {...props as RowProps<NameRowT> } />
    
    if (props.row.type === RowTypes.InputOnly)
        return <GeometryRowInputOnly {...props as RowProps<InputOnlyRowT> } />

    if (props.row.type === RowTypes.InputStacked)
        return <GeometryRowInputStacked {...props as RowProps<StackedInputRowT> } />
        
    if (props.row.type === RowTypes.Output)
    return <GeometryRowOutput {...props as RowProps<OutputRowT> } />
    
    if (props.row.type === RowTypes.Field)
        return <GeometryRowField {...props as RowProps<FieldRowT> } />
        
    if (props.row.type === RowTypes.Rotation)
    return <GeometryRowRotation {...props as RowProps<RotationRowT>} />

    console.warn('row component missing');
    
    return null;
}

export default GeometryRowRoot;