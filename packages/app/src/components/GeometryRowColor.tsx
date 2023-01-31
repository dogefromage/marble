import { color, ColorResult, Wheel } from '@uiw/react-color';
import React, { useRef } from 'react';
import styled from 'styled-components';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesAssignRowData } from '../slices/geometriesSlice';
import GeometryRowDiv from '../styles/GeometryRowDiv';
import GeometryRowNameP from '../styles/GeometryRowNameP';
import { ColorRowT, RowMetadata, ViewTypes } from '../types';
import { colorArrayToHex, hexToColorArray } from '../utils/color';
import GeometryInputJoint from './GeometryInputJoint';
import { rowMeta, RowMetaProps, RowProps } from './GeometryRowRoot';

export function getRowMetadataColor({ numConnectedJoints }: RowMetaProps<ColorRowT>): RowMetadata {
    return rowMeta({ 
        heightUnits: numConnectedJoints === 0 ? 7 : 1,
        dynamicValue: true,
    });
}

interface Props {
    zoom: number;
}

const ColorPickerDiv = styled.div.attrs<Props>(({ zoom }) => ({
    style: {
        '--inv-zoom': `scale(${zoom})`,
    }
}))<Props>`
    width: 100%;
    grid-row: 2 / 8;
    display: flex;
    justify-content: center;
    align-items: center;

    &>div {
        transform: var(--inv-zoom);
    }
`;

const WHEEL_SIZE = 140;

const GeometryRowColor = ({ geometryId, panelId, nodeId, row }: RowProps<ColorRowT>) => {
    const dispatch = useAppDispatch();
    const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));

    const moveRef = useRef({
        actionToken: '',
    });

    const mouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        moveRef.current = {
            actionToken: (new Date().getTime()).toString()
        };
    }

    const hexColor = colorArrayToHex(row.value);

    const colorChange = (newColor: ColorResult) => {
        const colorTuple = hexToColorArray(newColor.hex);
        dispatch(geometriesAssignRowData({
            geometryId: geometryId,
            nodeId: nodeId,
            rowId: row.id,
            rowData: { value: colorTuple },
            undo: { actionToken: moveRef.current.actionToken },
        }));
    }

    const meta = getRowMetadataColor({ 
        state: row, template: 
        row, numConnectedJoints: 
        row.numConnectedJoints 
    });

    if (!panelState) return null;

    // const invZoom = 1 / panelState.camera.zoom;
    // const zoomedSize = Math.floor(panelState.camera.zoom * WHEEL_SIZE);

    return (
        <GeometryRowDiv heightUnits={meta.heightUnits}>
            <GeometryRowNameP align='left'>
                {row.name}
            </GeometryRowNameP> { 
                row.numConnectedJoints === 0 &&
                <ColorPickerDiv onMouseDown={mouseDown} zoom={1}>
                    <Wheel
                        width={WHEEL_SIZE}
                        height={WHEEL_SIZE}
                        color={hexColor}
                        onChange={colorChange}
                    />
                </ColorPickerDiv>
            }
            <GeometryInputJoint
                geometryId={geometryId}
                jointLocation={{ nodeId, rowId: row.id, subIndex: 0 }}
                row={row}
            />
        </GeometryRowDiv>
    );
}

export default GeometryRowColor;