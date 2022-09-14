import React from 'react';
import { OutputRowT } from '../slices/GeometriesSlice/types/Geometry';
import GeometryJoint from './GeometryJoint';
import GeometryRowName from './GeometryRowName';
import { RowProps } from './GeometryRowRoot';
import GeometryRowDiv from './styled/GeometryRowDiv';
import GeometryRowNameP from './styled/GeometryRowNameP';

const GeometryRowOutput = ({ geometryId, nodeId, row, connected }: RowProps<OutputRowT>) =>
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
                location={{ nodeId, rowId: row.id }}
                direction='output'
                connected={connected}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowOutput;