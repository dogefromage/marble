import { DataTypes, FieldRowT, RowMetadata } from '../types';
import { assertIsZippedRow } from '../utils/geometries/assertions';
import GeometryRowFieldFloat from './GeometryRowFieldFloat';
import GeometryRowFieldVecN from './GeometryRowFieldVecN';
import { rowMeta, RowMetaProps, RowProps } from './GeometryRowRoot';

export function getRowMetadataField(row: RowMetaProps<FieldRowT>): RowMetadata
{
    if (row.connectedOutputs.length) return rowMeta(1, true);
    
    if (row.dataType === DataTypes.Vec2) return rowMeta(3, true);
    if (row.dataType === DataTypes.Vec3) return rowMeta(4, true);

    return rowMeta(1, true);
}

const GeometryRowField = (props: RowProps<FieldRowT>) =>
{
    if (props.row.dataType === DataTypes.Float)
        return <GeometryRowFieldFloat {...props as RowProps<FieldRowT<DataTypes.Float>>} />;
    
    if (props.row.dataType === DataTypes.Vec2 ||
        props.row.dataType === DataTypes.Vec3)
        return <GeometryRowFieldVecN {...props as RowProps<FieldRowT<DataTypes.Vec2 | DataTypes.Vec3>>} />;

    console.error('row component missing');
    return null;
}

export default GeometryRowField;