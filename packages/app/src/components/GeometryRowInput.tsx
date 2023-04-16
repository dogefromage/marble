import React from 'react';
import FlowRowDiv from '../styles/FlowRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import { BaseInputRowT } from '../types';
import GeometryInputJoint from './GeometryInputJoint';
import { RowProps } from './GeometryRowRoot';

const GeometryRowInputOnly = ({ geometryId, panelId, nodeId, row }: RowProps<BaseInputRowT>) => {
    return (
        <FlowRowDiv
            heightUnits={1}
        >
            <GeometryRowNameP
                align='left'
            >
                {row.name}
            </GeometryRowNameP>
            <GeometryInputJoint
                geometryId={geometryId}
                jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
                row={row}
            />
        </FlowRowDiv>
    );
}

export default GeometryRowInputOnly;