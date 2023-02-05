import React from 'react';
import styled from 'styled-components';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAssignRowData } from '../slices/geometriesSlice';
import GeometryRowDiv from '../styles/GeometryRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import { ColorRowT, ColorTuple, RowMetadata, ViewTypes } from '../types';
import FormColorPicker from './FormColorPicker';
import GeometryInputJoint from './GeometryInputJoint';
import { rowMeta, RowMetaProps, RowProps } from './GeometryRowRoot';

const SplitColorDiv = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 50px;
`;

export function getRowMetadataColor({ numConnectedJoints }: RowMetaProps<ColorRowT>): RowMetadata {
    return rowMeta({ heightUnits: 1, dynamicValue: true });
}


const GeometryRowColor = ({ geometryId, panelId, nodeId, row }: RowProps<ColorRowT>) => {
    const dispatch = useAppDispatch();
    const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));


    const onColorChanged = (newColor: ColorTuple, actionToken: string) => {
        dispatch(geometriesAssignRowData({
            geometryId: geometryId,
            nodeId: nodeId,
            rowId: row.id,
            rowData: { value: newColor },
            undo: { actionToken, desc: `Updated value of color row in active geometry.` },
        }));
    }

    const meta = getRowMetadataColor({ 
        state: row, template: 
        row, numConnectedJoints: 
        row.numConnectedJoints 
    });

    if (!panelState) return null;

    return (
        <GeometryRowDiv heightUnits={meta.heightUnits}>
            <SplitColorDiv>
                <GeometryRowNameP align='left'>
                    {row.name}
                </GeometryRowNameP> { 
                    row.numConnectedJoints === 0 &&
                    <FormColorPicker value={row.value} onChange={onColorChanged}/>
                }
            </SplitColorDiv>
            <GeometryInputJoint
                geometryId={geometryId}
                jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
                row={row}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowColor;