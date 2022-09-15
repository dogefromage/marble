import { useEffect } from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '../redux/hooks';
import { viewportPanelsCreatePanelState, viewportPanelsRemovePanelState } from '../slices/panelViewportSlice';
import { ViewProps } from '../types/View';
import ViewportCanvas from './ViewportCanvas';

const ViewPortDiv = styled.div`
    
    width: 100%;
    height: 100%;
`;

const ViewportView = ({ panelId }: ViewProps) =>
{
    const dispatch = useAppDispatch();

    useEffect(() =>
    {
        dispatch(viewportPanelsCreatePanelState({ panelId }));

        return () => { 
            dispatch(viewportPanelsRemovePanelState({ panelId })) 
        };
    }, [ panelId ]);

    return (
        <ViewPortDiv>
            <ViewportCanvas panelId={panelId} />
        </ViewPortDiv>
    )
}

export default ViewportView;