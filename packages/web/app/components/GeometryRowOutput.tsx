import React from 'react';
import { OutputRowT } from '../types';
import GeometryJoint from './GeometryJoint';
import GeometryRowName from './GeometryRowName';
import { RowProps } from './GeometryRowRoot';
import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';

const GeometryRowOutput = ({ geometryId, nodeId, row }: RowProps<OutputRowT>) =>
{
    return (
        <GeometryRowDiv
            heightUnits={1}
        >
            <GeometryRowNameP
                align='right'
            >
                { row.name }
            </GeometryRowNameP>
            <GeometryJoint 
                geometryId={geometryId}
                location={{ nodeId, rowId: row.id, subIndex: 0 }}
                direction='output'
                connected={row.connectedOutputs.length > 0}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowOutput;