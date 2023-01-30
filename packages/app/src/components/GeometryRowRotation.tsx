import { mat3, quat } from 'gl-matrix';
import React, { useEffect } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { geometriesAssignRowData } from '../slices/geometriesSlice';
import GeometryRowDiv from '../styles/GeometryRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import { IndentRowDiv } from '../styles/IndentRowDiv';
import { rotationModelNames, RotationModels, RotationRowT, RowMetadata, RowS, Tuple } from '../types';
import { Metrics } from '../types/world';
import { eulerToMat3, quaternionToEuler } from '../utils/linalg';
import GeometryJoint from './GeometryJoint';
import { rowMeta, RowMetaProps, RowProps } from './GeometryRowRoot';
import SelectOptionSubRow from './SelectOptionSubRow';
import SlidableInput from './SlideableInput';

export function getRowMetadataRotation(props: RowMetaProps<RotationRowT>): RowMetadata {
    if (props.numConnectedJoints > 0) return rowMeta(1, true);

    let totalUnits = 2; // name + model selector

    if (props.state?.currentDisplay) {
        if (props.state.currentDisplay.rotationModel === 'xyzw')
            totalUnits += 4; // xyzw
        else
            totalUnits += 3; // xyz
    }

    return rowMeta(totalUnits, true);
}

type Props = RowProps<RotationRowT>;

export const FIELD_ROW_LIST_NAMES = [ 'X', 'Y', 'Z', 'W' ];

const GeometryRowRotation = ({ geometryId, panelId, nodeId, row }: Props) => {
    const dispatch = useAppDispatch();
    const rowRotationModel = row.rotationModel || 'xyz';

    useEffect(() => {
        if (row.currentDisplay && row.currentDisplay.rotationModel === rowRotationModel)
            return; // all set

        // must (re)compute row.currentDisplay

        const rotationMatrix = mat3.fromValues(...row.value);
        const q = quat.fromMat3(quat.create(), rotationMatrix);

        let newDisplayValues: number[];

        if (rowRotationModel === 'xyzw') {
            newDisplayValues = [ ...q ];
        }
        else {
            newDisplayValues = [ ...quaternionToEuler(q) ];
        }

        const rowS: Partial<RowS<RotationRowT>> = {
            currentDisplay: {
                rotationModel: rowRotationModel,
                displayValues: newDisplayValues,
            }
        }

        const doNotRecord = row.currentDisplay == null;

        dispatch(geometriesAssignRowData({
            geometryId,
            nodeId,
            rowId: row.id,
            rowData: rowS,
            undo: { doNotRecord },
        }));
    }, [ rowRotationModel, row.currentDisplay ]);

    const updateValue = (index: number) =>
        (value: number, actionToken: string | undefined) => {
            if (!row.currentDisplay) return;

            const newDisplayValues = row.currentDisplay.displayValues.slice();
            newDisplayValues[ index ] = value;

            let rotationMatrix = mat3.create();

            if (row.currentDisplay.rotationModel === 'xyzw') {
                const q = quat.normalize(quat.create(), newDisplayValues as quat);
                mat3.fromQuat(rotationMatrix, q);
            }
            else {
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

    const switchRotationModel = (newModel: RotationModels) => {
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

    const meta = getRowMetadataRotation({
        state: row, template: row,
        numConnectedJoints: row.numConnectedJoints,
    });
    const metric = rowRotationModel == 'xyzw' ? undefined : Metrics.Angle;

    const isConnected = row.numConnectedJoints > 0;

    return (
        <GeometryRowDiv
            heightUnits={meta.heightUnits}
        >
            <GeometryRowNameP
                align='left'
            >
                {row.name}
            </GeometryRowNameP>
            {
                !isConnected && row.currentDisplay && <>
                {
                    <IndentRowDiv>
                        <SelectOptionSubRow
                            value={rowRotationModel}
                            onChange={(newModel: string) => {
                                switchRotationModel(newModel as RotationModels);
                            }}
                            options={Object.keys(rotationModelNames) as RotationModels[]}
                            mapName={rotationModelNames}
                        />
                    </IndentRowDiv>
                }{
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
                geometryId={geometryId}
                jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
                jointDirection='input'
                connected={isConnected}
                dataType={row.dataType}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowRotation;