import React, { useEffect, useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useAppDispatch } from '../redux/hooks';
import { geometryEditorPanelSetNewLink, selectGeometryEditorPanels } from '../slices/panelGeometryEditorSlice';
import { GeometryZ, ViewProps } from '../types';
import countHeightUnits from '../utils/geometries/countHeightUnits';
import getJointPosition from '../utils/geometries/getJointPosition';
import { pointScreenToWorld } from '../utils/geometries/planarCameraMath';
import { p2v, v2p } from '../utils/linalg';
import { usePanelState } from '../utils/panelState/usePanelState';
import GeometryLinkDiv from './GeometryLinkDiv';

interface Props
{
    viewProps: ViewProps;
    geometry: GeometryZ;
}

const GeometryLinkNew = ({ viewProps, geometry }: Props) =>
{
    const { newLink, camera } = usePanelState(selectGeometryEditorPanels, viewProps.panelId)!;

    const dispatch = useAppDispatch();
    
    const debouncedTrigger = useDebouncedValue(newLink, 100);
    useEffect(() =>
    {
        if (!debouncedTrigger) return;
        dispatch(geometryEditorPanelSetNewLink({
            panelId: viewProps.panelId,
            newLink: null,
        }))
    }, [ debouncedTrigger ]);

    if (!newLink) return null;

    const endLocation = newLink.endJointTransfer.location;
    const endNode = geometry.nodes.find(n => n.id == endLocation.nodeId);
    if (!endNode) return null;
    const rowIndex = endNode.rows.findIndex(r => r.id == endLocation.rowId);

    const endJointHeight = countHeightUnits(endNode.rows, rowIndex, endLocation.subIndex);
    const endJointPos = getJointPosition(endNode.position, endJointHeight, newLink.endJointTransfer.direction);

    const offsetPosVec = p2v(newLink.offsetPos);
    const worldCursor = pointScreenToWorld(camera, offsetPosVec);
    const worldPoint = v2p(worldCursor);

    return (
        <GeometryLinkDiv 
            A={endJointPos}
            B={worldPoint}
            dataType={newLink.endJointTransfer.dataType}
        />
    );
}

export default GeometryLinkNew;