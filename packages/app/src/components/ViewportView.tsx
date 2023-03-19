import React from 'react';
import { createViewportPanelState } from '../slices/panelViewportSlice';
import { ViewProps, ViewTypes } from '../types';
import { useBindPanelState } from '../utils/panelManager';
import PanelBody from './PanelBody';
import ViewportMain from './ViewportMain';

const ViewportView = (viewProps: ViewProps) => {
    useBindPanelState(
        viewProps.panelId,
        createViewportPanelState,
        ViewTypes.Viewport,
    );

    return (
        <PanelBody
            viewProps={viewProps}
        >
            <ViewportMain panelId={viewProps.panelId} />
        </PanelBody>
    )
}

export default ViewportView;