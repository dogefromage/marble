import React from 'react';
import { createViewportPanelState } from '../slices/panelViewportSlice';
import { ViewProps, ViewTypes } from '../types';
import { useBindPanelState } from '../utils/panelManager';
import PanelBody from './PanelBody';
import ViewportCanvas from './ViewportCanvas';

const ViewportView = (viewProps: ViewProps) =>
{
    useBindPanelState(
        viewProps.panelId, 
        createViewportPanelState,
        ViewTypes.Viewport,
    );

    return (
        <PanelBody
            viewProps={viewProps}
        >
            <ViewportCanvas panelId={viewProps.panelId} />
        </PanelBody>
    )
}

export default ViewportView;