import React from 'react';
import { useAppSelector } from '../redux/hooks';
import { selectSingleGeometry } from '../slices/geometriesSlice';
import { GeometryJointLocation, InputRowT, RowTypes, RowZ, DataTypes, RowT } from '../types';
import GeometryArgumentTag from './GeometryArgumentTag';
import GeometryJoint from './GeometryJoint';

interface Props {
    geometryId: string;
    row: RowZ & Pick<InputRowT, 'defaultArgumentToken' | 'dataType'>;
    jointLocation: GeometryJointLocation;
}

const GeometryInputJoint = ({ geometryId, row, jointLocation }: Props) => {

    const geometry = useAppSelector(selectSingleGeometry(geometryId));
    if (!geometry) return null;

    let incomingElement = row.incomingElements?.[ jointLocation.subIndex ];
    if (incomingElement == null &&
        jointLocation.subIndex === 0 &&
        row.defaultArgumentToken != null
    ) {
        incomingElement = {
            type: 'argument',
            argument: row.defaultArgumentToken,
        }
    }

    const argumentId = incomingElement?.type === 'argument' && incomingElement.argument;
    const argument = geometry.inputs.find(input => input.id === argumentId);

    return (<>
        {
            argument &&
            <GeometryArgumentTag
                geometryId={geometryId}
                argument={argument}
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