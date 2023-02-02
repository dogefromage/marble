import React from 'react';
import { DEFAULT_NODE_WIDTH } from '../styles/GeometryNodeDiv';
import { BaseInputRowT, ColorRowT, FieldRowT, NameRowT, OutputRowT, PassthroughRowT, RotationRowT, RowMetadata, RowS, RowT, RowZ, StackedInputRowT } from '../types';
import GeometryRowColor, { getRowMetadataColor } from './GeometryRowColor';
import GeometryRowField, { getRowMetadataField } from './GeometryRowField';
import GeometryRowInputOnly from './GeometryRowInput';
import GeometryRowInputStacked, { getRowMetadataStackedInput } from './GeometryRowInputStacked';
import GeometryRowName from './GeometryRowName';
import GeometryRowOutput from './GeometryRowOutput';
import GeometryRowPassthrough, { getRowMetadataPassthrough } from './GeometryRowPassthrough';
import GeometryRowRotation, { getRowMetadataRotation } from './GeometryRowRotation';

export type RowMetaProps<T extends RowT = RowT> = {
    template: T | RowZ<T>;
    state?: RowS<T> | RowZ<T>;
    numConnectedJoints: number;
};

export function rowMeta(props?: Partial<RowMetadata>): RowMetadata {
    return {
        heightUnits: 1,
        dynamicValue: false,
        minWidth: DEFAULT_NODE_WIDTH,
        ...props,
    }
}

export function getRowMetadata(props: RowMetaProps): RowMetadata {
    if (props.template.type === 'field')
        return getRowMetadataField(props as RowMetaProps<FieldRowT>);
    if (props.template.type === 'rotation')
        return getRowMetadataRotation(props as RowMetaProps<RotationRowT>);
    if (props.template.type === 'input_stacked')
        return getRowMetadataStackedInput(props as RowMetaProps<StackedInputRowT>);
    if (props.template.type === 'color')
        return getRowMetadataColor(props as RowMetaProps<ColorRowT>);
    if (props.template.type === 'passthrough')
        return getRowMetadataPassthrough(props as RowMetaProps<PassthroughRowT>);
    return rowMeta();
}

export type RowProps<T extends RowT = RowT> = {
    geometryId: string;
    panelId: string;
    nodeId: string;
    row: RowZ<T>;
}

const GeometryRowRoot = (props: RowProps) => {
    switch (props.row.type) {
        case 'name':
            return <GeometryRowName {...props as RowProps<NameRowT>} />;
        case 'input':
            return <GeometryRowInputOnly {...props as RowProps<BaseInputRowT>} />;
        case 'input_stacked':
            return <GeometryRowInputStacked {...props as RowProps<StackedInputRowT>} />;
        case 'output':
            return <GeometryRowOutput {...props as RowProps<OutputRowT>} />;
        case 'field':
            return <GeometryRowField {...props as RowProps<FieldRowT>} />;
        case 'rotation':
            return <GeometryRowRotation {...props as RowProps<RotationRowT>} />;
        case 'color':
            return <GeometryRowColor {...props as RowProps<ColorRowT>} />;
        case 'passthrough':
            return <GeometryRowPassthrough {...props as RowProps<PassthroughRowT>} />;
        default:
            console.warn('row component missing');
            return null;
    }
}

export default GeometryRowRoot;