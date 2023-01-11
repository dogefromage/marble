import React from 'react';
import { GeometryIncomingElementTypes, GeometryJointLocation, RowT, RowZ, SuperInputRowT } from '../types';
import GeometryArgumentTag from './GeometryArgumentTag';
import GeometryJoint from './GeometryJoint';

interface Props
{
    geometryId: string;
    row: RowZ<RowT & SuperInputRowT>;
    jointLocation: GeometryJointLocation;
}

const GeometryInputJoint = ({ geometryId, row, jointLocation }: Props) =>
{
    let incomingElement = row.incomingElements?.[jointLocation.subIndex];

    if (incomingElement == null && 
        jointLocation.subIndex === 0 && 
        row.defaultArgumentToken != null
    ) {
        incomingElement = {
            type: GeometryIncomingElementTypes.Argument,
            argument: {
                identifier: row.defaultArgumentToken,
                dataType: row.dataType,
            }
        }
    }

    return (<>
        {
            incomingElement?.type === GeometryIncomingElementTypes.Argument &&
            <GeometryArgumentTag 
                geometryId={geometryId}
                argument={incomingElement.argument}
            />
        }
        <GeometryJoint 
            geometryId={ geometryId }
            jointLocation={jointLocation}
            jointDirection='input'
            connected={incomingElement != null}
            dataType={row.dataType}
        />
    </>);
}

export default GeometryInputJoint;