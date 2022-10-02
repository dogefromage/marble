import { FieldRowT, DataTypes } from '../types';
import GeometryRowFieldFloat from './GeometryRowFieldFloat';
import GeometryRowFieldVec2 from './GeometryRowFieldVec2';
import { RowProps } from './GeometryRowRoot';

const GeometryRowField = (props: RowProps<FieldRowT>) =>
{
    if (props.row.dataType === DataTypes.Float)
        return <GeometryRowFieldFloat {...props as RowProps<FieldRowT<DataTypes.Float>>} />;
        
    if (props.row.dataType === DataTypes.Vec2)
        return <GeometryRowFieldVec2 {...props as RowProps<FieldRowT<DataTypes.Vec2>>} />;
    
    console.warn('row component missing');
    return null;
}

export default GeometryRowField;