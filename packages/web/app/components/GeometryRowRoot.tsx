import { FieldRowT, InputOnlyRowT, NameRowT, OutputRowT, RowTypes, RowZ } from '../types';
import GeometryRowField from './GeometryRowField';
import GeometryRowInputOnly from './GeometryRowInputOnly';
import GeometryRowName from './GeometryRowName';
import GeometryRowOutput from './GeometryRowOutput';

export type RowProps<T extends RowZ = RowZ> =
{
    geometryId: string;
    nodeId: string;
    connected: boolean;
    row: T;
}

const GeometryRowRoot = (props: RowProps) =>
{
    if (props.row.type === RowTypes.Name)
        return <GeometryRowName {...props as RowProps<NameRowT> } />
    
    if (props.row.type === RowTypes.InputOnly)
        return <GeometryRowInputOnly {...props as RowProps<InputOnlyRowT> } />
        
    if (props.row.type === RowTypes.Output)
    return <GeometryRowOutput {...props as RowProps<OutputRowT> } />
    
    if (props.row.type === RowTypes.Field)
        return <GeometryRowField {...props as RowProps<FieldRowT> } />

    console.warn('row component missing');
    
    return null;
}

export default GeometryRowRoot;