import React from 'react';
import { GeometryJointLocation, InputRowT, RowZ } from '../types';
import GeometryArgumentTag from './GeometryArgumentTag';
import GeometryJoint from './GeometryJoint';

interface Props {
    geometryId: string;
    row: RowZ<InputRowT>;
    jointLocation: GeometryJointLocation;
}

const GeometryInputJoint = ({ geometryId, row, jointLocation }: Props) => {
    let incomingElement = row.incomingElements?.[ jointLocation.subIndex ];
    const argumentId = incomingElement == null && row.defaultParameter || undefined;

    return (<>
        {
            argumentId &&
            <GeometryArgumentTag
                geometryId={geometryId}
                argumentId={argumentId}
            />
        }
        <GeometryJoint
            geometryId={geometryId}
            jointLocation={jointLocation}
            jointDirection='input'
            connected={incomingElement != null}
            dataType={row.dataType}
        />
    </>);
}

export default GeometryInputJoint;