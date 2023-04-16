import React from 'react';
import FlowRowDiv from '../styles/FlowRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import { PassthroughRowT, RowMetadata } from '../types';
import GeometryArgumentTag from './GeometryArgumentTag';
import FlowJoint from './FlowJoint';
import { rowMeta, RowMetaProps, RowProps } from './GeometryRowRoot';

export function getRowMetadataPassthrough(props: RowMetaProps<PassthroughRowT>): RowMetadata {
    return rowMeta({ 
        minWidth: 65, 
    });
}

const GeometryRowPassthrough = ({ geometryId, panelId, nodeId, row }: RowProps<PassthroughRowT>) => {

    const argumentId = row.defaultParameter;

    return (
        <FlowRowDiv
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
            <FlowJoint
                flowId={geometryId}
                jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
                jointDirection='output'
                dataType={row.dataType}
                connected={row.numConnectedJoints > 0}
            />
        </FlowRowDiv>
    );
}

export default GeometryRowPassthrough;