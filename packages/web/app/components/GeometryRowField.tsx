import { DataTypes, FieldRowT } from '../types/Geometry';
import GeometryRowFieldFloat from './GeometryRowFieldFloat';
import { RowProps } from './GeometryRowRoot';

const GeometryRowField = (props: RowProps<FieldRowT>) =>
{
    if (props.row.dataType === DataTypes.Float)
        return <GeometryRowFieldFloat {...props} />;
    
    return null;
}

export default GeometryRowField;