import styled from 'styled-components';
import { useAppDispatch } from '../redux/hooks';
import { createViewportPanelState } from '../slices/panelViewportSlice';
import { ViewTypes } from '../types';
import { ViewProps } from '../types/View';
import { useBindPanelState } from '../utils/panelState/useBindPanelState';
import ViewportCanvas from './ViewportCanvas';

const ViewPortDiv = styled.div`
    
    width: 100%;
    height: 100%;
`;

const ViewportView = ({ panelId }: ViewProps) =>
{
    useBindPanelState(
        panelId, 
        createViewportPanelState,
        ViewTypes.Viewport,
    );

    return (
        <ViewPortDiv>
            <ViewportCanvas panelId={panelId} />
        </ViewPortDiv>
    )
}

export default ViewportView;