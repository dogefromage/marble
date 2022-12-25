import { InputOnlyRowT } from '../types';
import GeometryJoint from './GeometryJoint';
import { RowProps } from './GeometryRowRoot';
import GeometryRowDiv from '../styles/GeometryRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import React from 'react';

const GeometryRowInputOnly = ({ geometryId, panelId, nodeId, row: row }: RowProps<InputOnlyRowT>) =>
{
    return (
        <GeometryRowDiv
            heightUnits={1}
        >
            <GeometryRowNameP
                align='left'
            >
                { row.name }
            </GeometryRowNameP>
            <GeometryJoint 
                geometryId={geometryId}
                jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
                jointDirection='input'
                connected={row.numConnectedJoints > 0}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowInputOnly;