import React from 'react';
import { GeometryJointLocation, InputRowT, RowZ } from '../types';
import GeometryArgumentTag from './GeometryArgumentTag';
import FlowJoint from './FlowJoint';

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
        <FlowJoint
            flowId={geometryId}
            jointLocation={jointLocation}
            jointDirection='input'
            connected={incomingElement != null}
            dataType={row.dataType}
        />
    </>);
}

export default GeometryInputJoint;