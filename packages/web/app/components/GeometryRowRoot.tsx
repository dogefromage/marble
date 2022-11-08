import { FieldRowT, InputOnlyRowT, NameRowT, OutputRowT, RotationRowT, RowMetadata, RowT, RowTypes, RowZ, StackedInputRowT } from '../types';
import GeometryRowField, { getRowMetadataField } from './GeometryRowField';
import GeometryRowInputOnly from './GeometryRowInputOnly';
import GeometryRowInputStacked from './GeometryRowInputStacked';
import GeometryRowName from './GeometryRowName';
import GeometryRowOutput from './GeometryRowOutput';
import GeometryRowRotation, { getRowMetadataRotation } from './GeometryRowRotation';

export type RowMetaProps<T extends RowT = RowT> = RowZ<T>;

export function rowMeta(heightUnits = 1, dynamicValue = false): RowMetadata
{
    return { heightUnits, dynamicValue };
}

export function getRowMetadata(row: RowMetaProps): RowMetadata
{
    if (row.type === RowTypes.Field)
        return getRowMetadataField(row as RowMetaProps<FieldRowT>);

    if (row.type === RowTypes.Rotation)
        return getRowMetadataRotation(row as RowMetaProps<RotationRowT>);

    return rowMeta();
}

export type RowProps<T extends RowT = RowT> =
{
    geometryId: string;
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