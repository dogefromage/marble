import { mat3, quat } from 'gl-matrix';
import { useEffect } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { geometriesAssignRowData } from '../slices/geometriesSlice';
import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';
import { IndentRowDiv } from '../styled/IndentRowDiv';
import { RotationModels, RotationRowT, RowMetadata, RowS, Tuple } from '../types';
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
        if (row.currentDisplay && row.currentDisplay.rotationModel === row.rotationModel) 
            return; // all set

        // must (re)compute row.currentDisplay

        const rotationMatrix = mat3.fromValues(...row.value);
        const q = quat.fromMat3(quat.create(), rotationMatrix);

        let newDisplayValues: number[];

        if (row.rotationModel === RotationModels.Quaternion)
        {
            newDisplayValues = [ ...q ];
        }
        else
        {
            newDisplayValues = [ ...quaternionToEuler(q) ];
        }

        const rowS: Partial<RowS<RotationRowT>> = {
            currentDisplay: {
                rotationModel: row.rotationModel,
                displayValues: newDisplayValues,
            }
        }

        dispatch(geometriesAssignRowData({
            geometryId,
            nodeId,
            rowId: row.id,
            rowData: rowS,
            undo: {},
        }));
    }, [ row.rotationModel, row.currentDisplay ]);

    const updateValue = (index: number) => 
        (value: number, actionToken: string | undefined) =>
    {
        if (!row.currentDisplay) return;

        const newDisplayValues = row.currentDisplay.displayValues.slice();
        newDisplayValues[index] = value;

        let rotationMatrix = mat3.create();

        if (row.currentDisplay.rotationModel === RotationModels.Quaternion)
        {
            const q = newDisplayValues as quat;
            mat3.fromQuat(rotationMatrix, q);
        }
        else
        {
            rotationMatrix = eulerToMat3(newDisplayValues, row.currentDisplay.rotationModel);
        }

        const rowS: Partial<RowS<RotationRowT>> = {
            currentDisplay: {
                rotationModel: row.rotationModel,
                displayValues: newDisplayValues,
            },
            value: [ ...rotationMatrix ] as Tuple<number, 9>,
        }

        dispatch(geometriesAssignRowData({
            geometryId: geometryId,
            nodeId: nodeId,
            rowId: row.id, 
            rowData: rowS,
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
                !connected && row.currentDisplay &&
                row.currentDisplay.displayValues.map((value, index) =>
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