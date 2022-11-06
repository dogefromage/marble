import { mat3, quat, vec3 } from 'gl-matrix';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { geometriesAssignRowData } from '../slices/geometriesSlice';
import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';
import { IndentRowDiv } from '../styled/IndentRowDiv';
import { RotationModels, RotationRowT, RowMetadata } from '../types';
import { assertIsZippedRow } from '../utils/geometries/assertions';
import { eulerToMat3, quaternionToEuler } from '../utils/linalg';
import GeometryJoint from './GeometryJoint';
import { rowMeta, RowMetaProps, RowProps } from './GeometryRowRoot';
import SlidableInput from './SlideableInput';

export function getRowMetadataRotation(row: RowMetaProps<RotationRowT>): RowMetadata
{
    if (assertIsZippedRow(row))
    {
        if (row.connectedOutputs.length) return rowMeta(1, true);
    }
    
    return rowMeta(4, true);
}

type Props = RowProps<RotationRowT>;

export const FIELD_ROW_LIST_NAMES = [ 'X', 'Y', 'Z', 'W' ];

const GeometryRowRotation = ({ geometryId, nodeId, row }: Props) =>
{
    const dispatch = useAppDispatch();
    const connected = row.connectedOutputs.length > 0;

    useEffect(() =>
    {
        const rotationMatrix = mat3.fromValues(...row.value);
        const q = quat.fromMat3(quat.create(), rotationMatrix);

        let newDisplayValue: number[];

        if (row.display.rotationModel === RotationModels.Quaternion)
        {
            newDisplayValue = [ ...q ];
        }
        else
        {
            newDisplayValue = [ ...quaternionToEuler(q) ];
        }

        dispatch(geometriesAssignRowData({
            geometryId,
            nodeId,
            rowId: row.id,
            rowData: { display: { displayValue: newDisplayValue } },
            undo: {},
        }));
    }, [ row.display.rotationModel ]);

    const updateValue = (index: number) => 
        (value: number, actionToken: string | undefined) =>
    {
        if (!row.display.displayValues) return;

        const newDisplayValue = row.display.displayValues.slice();
        newDisplayValue[index] = value;
        
        dispatch(geometriesAssignRowData({
            geometryId,
            nodeId,
            rowId: row.id,
            rowData: { display: { displayValue: newDisplayValue } },
            undo: { actionToken },
        }));

        let rotationMatrix = mat3.create();

        if (row.display.rotationModel === RotationModels.Quaternion)
        {
            const q = newDisplayValue as quat;
            mat3.fromQuat(rotationMatrix, q);
        }
        else
        {
            rotationMatrix = eulerToMat3(newDisplayValue, row.display.rotationModel);
        }

        dispatch(geometriesAssignRowData({
            geometryId: geometryId,
            nodeId: nodeId,
            rowId: row.id, 
            rowData: { value: [ ...rotationMatrix ] },
            undo: { actionToken },
        }));
    }

    const meta = getRowMetadataRotation(row);

    return (
        <GeometryRowDiv
            heightUnits={meta.heightUnits}
        >
            <GeometryRowNameP
                align='left'
            >
                { row.name }
            </GeometryRowNameP>
            {
                !connected && row.display.displayValues &&
                row.display.displayValues.map((value, index) =>
                    <IndentRowDiv
                        key={index}
                    >
                        <SlidableInput
                            value={value}
                            onChange={updateValue(index)}
                            name={FIELD_ROW_LIST_NAMES[ index ]} 
                        />
                    </IndentRowDiv>
                )
            }
            <GeometryJoint 
                geometryId={ geometryId }
                location={{ nodeId, rowId: row.id, subIndex: 0 }}
                direction='input'
                connected={connected}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowRotation;