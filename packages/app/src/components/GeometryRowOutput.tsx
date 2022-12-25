import React from 'react';
import GeometryRowDiv from '../styles/GeometryRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import { OutputRowT } from '../types';
import GeometryJoint from './GeometryJoint';
import { RowProps } from './GeometryRowRoot';

const GeometryRowOutput = ({ geometryId, panelId, nodeId, row }: RowProps<OutputRowT>) =>
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
                jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
                jointDirection='output'
                connected={row.numConnectedJoints > 0}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowOutput;