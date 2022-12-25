import React from 'react';
import { createViewportPanelState } from '../slices/panelViewportSlice';
import { ViewTypes } from '../types';
import { ViewProps } from '../types/view/ViewProps';
import { useBindPanelState } from '../utils/panelState/useBindPanelState';
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