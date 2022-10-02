import styled from 'styled-components';
import { DataTypes, FieldRowT, RowZ } from '../types';
import GeometryRowFieldFloat from './GeometryRowFieldFloat';
import GeometryRowFieldVecN from './GeometryRowFieldVecN';
import { RowProps } from './GeometryRowRoot';

export function getRowHeightFields(row: RowZ<FieldRowT>)
{
    if (row.connectedOutput) return 1;
    if (row.dataType === DataTypes.Vec2) return 3;
    if (row.dataType === DataTypes.Vec3) return 4;
    return 1;
}

const GeometryRowField = (props: RowProps<FieldRowT>) =>
{
    if (props.row.dataType === DataTypes.Float)
        return <GeometryRowFieldFloat {...props as RowProps<FieldRowT<DataTypes.Float>>} />;
    
    if (props.row.dataType === DataTypes.Vec2 ||
        props.row.dataType === DataTypes.Vec3)
        return <GeometryRowFieldVecN {...props as RowProps<FieldRowT<DataTypes.Vec2 | DataTypes.Vec3>>} />;
    
    console.warn('row component missing');
    return null;
}

export default GeometryRowField;