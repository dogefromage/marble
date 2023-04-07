import React from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectFlows } from '../slices/flowsSlice';
import { BOX_SHADOW } from '../styles/utils';
import { flowEditorPanelsSetFlowId } from '../slices/panelFlowEditorSlice';

const BreadcrumbsWrapperDiv = styled.div`
    top: 0.5rem;
    left: 1rem;
    position: absolute;
    display: flex;
    flex-direction: row-reverse;
    gap: 0rem;
`;

const BreadcrumbsDiv = styled.div`

    filter: drop-shadow(3px 4px #00000055);

    a {
        display: block;
        height: 1.6rem;

        --l: 0.5rem;
        --r: calc(100% - var(--l));

        clip-path: polygon(
            0 0,
            var(--r) 0,
            100% 50%,
            var(--r) 100%,
            0 100%,
            var(--l) 50%
        );

        padding: 0.25rem 1rem;
        background-color: white;
        display: flex;
        align-items: center;
        font-weight: bold;
        cursor: pointer;
        
        &:hover {
            background-color: #ddd;
        }
    }
`;

interface Props {
    panelId: string;
    flowStack: string[];
}

const FlowEditorBreadCrumbs = ({ panelId, flowStack }: Props) => {

    const flows = useAppSelector(selectFlows);
    const dispatch = useAppDispatch();

    const selectGeometry = (flowId: string) => {
        dispatch(flowEditorPanelsSetFlowId({
            panelId, flowId,
        }));
    }

    return (
        <BreadcrumbsWrapperDiv>
            {
                flowStack.map((flowId, index) =>
                    <BreadcrumbsDiv
                        key={flowId + index}
                    >
                        {/* <div className='inner'> */}
                        <a onClick={() => selectGeometry(flowId)}>
                            {flows[flowId]?.name || flowId}
                        </a>
                        {/* </div> */}
                    </BreadcrumbsDiv>
                )
            }
        </BreadcrumbsWrapperDiv>
    );
}

export default FlowEditorBreadCrumbs;