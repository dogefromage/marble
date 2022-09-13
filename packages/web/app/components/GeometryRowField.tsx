import React from 'react';
import { FieldRowT } from '../slices/GeometriesSlice/types/Geometry';
import GeometryJoint from './GeometryJoint';
import { RowProps } from './GeometryRowRoot';
import GeometryRowDiv from './styled/GeometryRowDiv';

const GeometryRowField = ({ geometryId, nodeId, row }: RowProps<FieldRowT>) =>
{


    return (
        <GeometryRowDiv
            heightUnits={1}
        >
            <p>I am field</p>
            <GeometryJoint 
                geometryId={ geometryId }
                location={{ nodeId, rowId: row.id }}
                direction='input'
                connected={false}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
        
    );
}

export default GeometryRowField;