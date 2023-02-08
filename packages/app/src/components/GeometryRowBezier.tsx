import React from 'react';
import GeometryRowDiv from '../styles/GeometryRowDiv';
import { BezierRowT, RowMetadata } from '../types';
import FormBezierEditor, { BEZIER_GRID_UNITS, BEZIER_WIDTH_PIXELS } from './FormBezierEditor';
import { rowMeta, RowMetaProps, RowProps } from './GeometryRowRoot';

export function getRowMetadataBezier(props: RowMetaProps<BezierRowT>): RowMetadata {
    return rowMeta({ 
        heightUnits: BEZIER_GRID_UNITS, 
        dynamicValue: true,
        minWidth: BEZIER_WIDTH_PIXELS,
    });
}

const GeometryRowBezier = ({ row }: RowProps<BezierRowT>) => {

    return (
        <GeometryRowDiv heightUnits={BEZIER_GRID_UNITS}>
            <FormBezierEditor
                value={row.value}
                onChange={() => {}}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowBezier;