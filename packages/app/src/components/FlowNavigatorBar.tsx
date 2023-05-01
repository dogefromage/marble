import React from 'react';
import styled, { css } from 'styled-components';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { selectFlows } from '../slices/flowsSlice';
import { flowEditorPanelsSetFlowId } from '../slices/panelFlowEditorSlice';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { ViewTypes } from '../types';

interface Props {
    panelId: string;
}

const FlowNavigatorBar = ({ panelId }: Props) => {
    const flows = useAppSelector(selectFlows);
    const panelState = useAppSelector(selectPanelState(ViewTypes.FlowEditor, panelId));
    const dispatch = useAppDispatch();

    const selectGeometry = (flowId: string) => {
        dispatch(flowEditorPanelsSetFlowId({
            panelId, flowId,
        }));
    }

    return (
        <BarWrapper>
            {
                panelState?.flowStack.map((flowId, index) =>
                    <HandleButton
                        key={flowId + index}
                        onClick={() => selectGeometry(flowId)}
                        isActive={index === 0}
                    >
                        {flows[flowId]?.name || flowId}
                    </HandleButton>
                )
            }
        </BarWrapper>
    );
}

export default FlowNavigatorBar;

const BarWrapper = styled.div`
    height: 2rem;
    background-color: #eee;
    display: flex;
    align-items: center;
`;

const HandleButton = styled.button<{ isActive: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;

    min-width: 160px;
    height: 100%;
    padding: 0 1rem;

    outline: none;
    border: none;
    cursor: pointer;

    /* font-size: 1rem; */
    color: white;
    font-weight: bold;

    ${({ isActive, theme }) => isActive ? css`
        /* ACTIVE */
        background-color: ${theme.colors.flowEditor.background};
    ` : css`
        /* INACTIVE */
        background-color: #777;
        &:hover, &:active {
            background-color: #666;
        }
    `}
`;