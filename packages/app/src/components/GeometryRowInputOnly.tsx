import React from 'react';
import GeometryRowDiv from '../styles/GeometryRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import { InputOnlyRowT } from '../types';
import GeometryInputJoint from './GeometryInputJoint';
import { RowProps } from './GeometryRowRoot';

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
            <GeometryInputJoint 
                geometryId={geometryId}
                jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
                row={row}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowInputOnly;