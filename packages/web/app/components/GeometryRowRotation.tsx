import { mat3, quat } from 'gl-matrix';
import { useEffect } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { geometriesAssignRowData } from '../slices/geometriesSlice';
import GeometryRowDiv from '../styled/GeometryRowDiv';
import GeometryRowNameP from '../styled/GeometryRowNameP';
import { IndentRowDiv } from '../styled/IndentRowDiv';
import { RotationModels, RotationRowT, RowMetadata, RowS, Tuple } from '../types';
import { Metrics } from '../types/world';
import { eulerToMat3, quaternionToEuler } from '../utils/linalg';
import GeometryJoint from './GeometryJoint';
import { rowMeta, RowMetaProps, RowProps } from './GeometryRowRoot';
import SelectOption from './SelectOption';
import SlidableInput from './SlideableInput';

export function getRowMetadataRotation(row: RowMetaProps<RotationRowT>): RowMetadata
{
    if (row.connectedOutputs.length) return rowMeta(1, true);

    let totalUnits = 2; // name + model selector

    if (row.currentDisplay && 
        row.currentDisplay.rotationModel === RotationModels.Quaternion)
    {
        totalUnits += 4; // xyzw
    }
    else if (row.currentDisplay)
    {
        totalUnits += 3; // xyz
    }
    
    return rowMeta(totalUnits, true);
}

type Props = RowProps<RotationRowT>;

export const FIELD_ROW_LIST_NAMES = [ 'X', 'Y', 'Z', 'W' ];

const GeometryRowRotation = ({ geometryId, nodeId, row }: Props) =>
{
    const dispatch = useAppDispatch();
    const connected = row.connectedOutputs.length > 0;

    const rowRotationModel = row.rotationModel || RotationModels.Euler_XYZ;

    useEffect(() =>
    {
        if (row.currentDisplay && row.currentDisplay.rotationModel === rowRotationModel) 
            return; // all set

        // must (re)compute row.currentDisplay

        const rotationMatrix = mat3.fromValues(...row.value);
        const q = quat.fromMat3(quat.create(), rotationMatrix);

        let newDisplayValues: number[];

        if (rowRotationModel === RotationModels.Quaternion)
        {
            newDisplayValues = [ ...q ];
        }
        else
        {
            newDisplayValues = [ ...quaternionToEuler(q) ];
        }

        const rowS: Partial<RowS<RotationRowT>> = {
            currentDisplay: {
                rotationModel: rowRotationModel,
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
    }, [ rowRotationModel, row.currentDisplay ]);

    const updateValue = (index: number) => 
        (value: number, actionToken: string | undefined) =>
    {
        if (!row.currentDisplay) return;

        const newDisplayValues = row.currentDisplay.displayValues.slice();
        newDisplayValues[index] = value;

        let rotationMatrix = mat3.create();

        if (row.currentDisplay.rotationModel === RotationModels.Quaternion)
        {
            const q = quat.normalize(quat.create(), newDisplayValues as quat);
            mat3.fromQuat(rotationMatrix, q);
        }
        else
        {
            rotationMatrix = eulerToMat3(newDisplayValues, row.currentDisplay.rotationModel);
        }

        const rowS: Partial<RowS<RotationRowT>> = {
            currentDisplay: {
                rotationModel: rowRotationModel,
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

    const switchRotationModel = (newModel: RotationModels) =>
    {
        const rowS: Partial<RowS<RotationRowT>> = {
            rotationModel: newModel,
        }

        dispatch(geometriesAssignRowData({
            geometryId: geometryId,
            nodeId: nodeId,
            rowId: row.id, 
            rowData: rowS,
            undo: {},
        }));
    }

    const meta = getRowMetadataRotation(row);
    const metric = rowRotationModel == RotationModels.Quaternion ? undefined : Metrics.Angle;

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
                !connected && row.currentDisplay && <>
                {
                    <IndentRowDiv>
                        <SelectOption 
                            value={rowRotationModel} 
                            onChange={switchRotationModel as (newMode: string) => void}   
                            options={Object.values(RotationModels)} 
                        />
                    </IndentRowDiv>
                }
                {
                    row.currentDisplay.displayValues.map((value, index) =>
                        <IndentRowDiv
                            key={index}
                        >
                            <SlidableInput
                                value={value}
                                onChange={updateValue(index)}
                                name={FIELD_ROW_LIST_NAMES[ index ]} 
                                metric={metric}
                            />
                        </IndentRowDiv>
                    )
                }
                </>
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