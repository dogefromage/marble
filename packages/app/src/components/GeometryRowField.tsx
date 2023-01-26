import React from 'react';
import { DataTypes, FieldRowT, RowMetadata } from '../types';
import GeometryRowFieldFloat from './GeometryRowFieldFloat';
import GeometryRowFieldVecN from './GeometryRowFieldVecN';
import { rowMeta, RowMetaProps, RowProps } from './GeometryRowRoot';

export function getRowMetadataField(props: RowMetaProps<FieldRowT>): RowMetadata
{
    if (props.numConnectedJoints > 0) return rowMeta(1, true);
    
    if (props.template.dataType === 'vec2') return rowMeta(3, true);
    if (props.template.dataType === 'vec3') return rowMeta(4, true);

    return rowMeta(1, true);
}

const GeometryRowField = (props: RowProps<FieldRowT>) =>
{
    if (props.row.dataType === 'float')
        return <GeometryRowFieldFloat {...props as RowProps<FieldRowT<'float'>>} />;
    
    if (props.row.dataType === 'vec2' ||
        props.row.dataType === 'vec3')
        return <GeometryRowFieldVecN {...props as RowProps<FieldRowT<'vec2' | 'vec3'>>} />;

    console.error('row component missing');
    return null;
}

export default GeometryRowField;