import React from 'react';
import FlowRowDiv from '../styles/FlowRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import { OutputRowT } from '../types';
import FlowJoint from './FlowJoint';
import { RowProps } from './GeometryRowRoot';

const GeometryRowOutput = ({ geometryId, panelId, nodeId, row }: RowProps<OutputRowT>) =>
{
    return (
        <FlowRowDiv
            heightUnits={1}
        >
            <GeometryRowNameP
                align='right'
            >
                { row.name }
            </GeometryRowNameP>
            <FlowJoint 
                flowId={geometryId}
                jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
                jointDirection='output'
                connected={row.numConnectedJoints > 0}
                dataType={row.dataType}
            />
        </FlowRowDiv>
    );
}

export default GeometryRowOutput;