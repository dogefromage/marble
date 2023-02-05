import React from 'react';
import { useAppDispatch } from '../redux/hooks';
import { geometriesAssignRowData } from '../slices/geometriesSlice';
import GeometryRowDiv from '../styles/GeometryRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import { DataTypes, FieldRowT } from '../types';
import GeometryInputJoint from './GeometryInputJoint';
import { RowProps } from './GeometryRowRoot';
import SlidableInput from './SlideableInput';

type Props = RowProps<FieldRowT<'float'>>;

const GeometryRowFieldFloat = ({ geometryId, nodeId, row }: Props) =>
{
    const dispatch = useAppDispatch();
    const isConnected = row.numConnectedJoints > 0;

    return (
        <GeometryRowDiv
            heightUnits={1}
        >
            {
                isConnected ? (
                    <GeometryRowNameP
                        align='left'
                    >
                        { row.name }
                    </GeometryRowNameP>
                ) : (
                    <SlidableInput 
                        value={row.value}
                        onChange={(value, actionToken) => dispatch(geometriesAssignRowData({
                            geometryId: geometryId,
                            nodeId: nodeId,
                            rowId: row.id, 
                            rowData: { value },
                            undo: { actionToken, desc: `Updated row field value.` },
                        }))}
                        name={row.name}
                    />
                )
            }
            <GeometryInputJoint 
                geometryId={geometryId}
                row={row}
                jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowFieldFloat;