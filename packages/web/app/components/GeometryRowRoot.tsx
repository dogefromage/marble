import { FieldRowT, InputOnlyRowT, NameRowT, OutputRowT, RowMetadata, RowT, RowTypes, RowZ, StackedInputRowT } from '../types';
import GeometryRowField, { getRowMetadataField } from './GeometryRowField';
import GeometryRowInputOnly from './GeometryRowInputOnly';
import GeometryRowInputStacked from './GeometryRowInputStacked';
import GeometryRowName from './GeometryRowName';
import GeometryRowOutput from './GeometryRowOutput';

export type RowMetaProps<T extends RowT = RowT> = T | RowZ<T>;

export function rowMeta(heightUnits = 1, dynamicValue = false): RowMetadata
{
    return { heightUnits, dynamicValue };
}

export function getRowMetadata(row: RowMetaProps): RowMetadata
{
    if (row.type === RowTypes.Field)
        return getRowMetadataField(row as RowMetaProps<FieldRowT>);

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

    console.warn('row component missing');
    
    return null;
}

export default GeometryRowRoot;