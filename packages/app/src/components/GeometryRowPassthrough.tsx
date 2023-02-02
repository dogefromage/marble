import React from 'react';
import GeometryRowDiv from '../styles/GeometryRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import MaterialSymbol from '../styles/MaterialSymbol';
import { PassthroughRowT, RowMetadata } from '../types';
import GeometryArgumentTag from './GeometryArgumentTag';
import GeometryJoint from './GeometryJoint';
import { rowMeta, RowMetaProps, RowProps } from './GeometryRowRoot';

export function getRowMetadataPassthrough(props: RowMetaProps<PassthroughRowT>): RowMetadata {
    return rowMeta({ 
        minWidth: 65, 
    });
}

const GeometryRowPassthrough = ({ geometryId, panelId, nodeId, row }: RowProps<PassthroughRowT>) => {

    const argumentId = row.defaultArgumentToken;

    return (
        <GeometryRowDiv
            heightUnits={1}
        >
            <GeometryRowNameP align='left'>Input</GeometryRowNameP> 
            {
                argumentId &&
                <GeometryArgumentTag
                    geometryId={geometryId}
                    argumentId={argumentId}
                />
            }
            <GeometryJoint
                geometryId={geometryId}
                jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
                jointDirection='output'
                dataType={row.dataType}
                connected={row.numConnectedJoints > 0}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowPassthrough;