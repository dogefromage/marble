import { FlowNode } from '@marble/language';
import React from 'react';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppSelector } from '../redux/hooks';
import { selectFlowContext } from '../slices/contextSlice';
import { selectSingleFlow } from '../slices/flowsSlice';
import { FlowEditorPanelState, SelectionStatus } from '../types';
import { ViewTypes } from '../types/panelManager/views';
import FlowNodeElement from './FlowNodeElement';
import FlowEdges from './FlowEdges';

interface Props {
    panelId: string;
    flowId: string;
    getPanelState: () => FlowEditorPanelState;
}

const FlowEditorContent = ({ flowId, panelId, getPanelState }: Props) => {
    // const flow = useAppSelector(selectSingleFlow(flowId));
    const context = useAppSelector(selectFlowContext(flowId));
    const panelState = useAppSelector(selectPanelState(ViewTypes.FlowEditor, panelId));

    if (/* !flow ||  */!context || !panelState) return <p>Loading...</p>;

    // // New link
    // const newLink = panelState?.newLink;
    // const newLinkNodeIndex = geometry?.nodes.findIndex(node => node.id === newLink?.location.nodeId);
    // const newLinkNode = geometry?.nodes[newLinkNodeIndex!];
    // const newLinkData = connectionData.nodeDatas[newLinkNodeIndex!];

    return (
        <>
            <FlowEdges panelId={panelId} flowId={flowId} />
            {
                // newLink && newLinkNode && newLinkData &&
                // <GeometryLinkNew
                //     panelId={panelId}
                //     newLink={newLink}
                //     node={newLinkNode}
                //     nodeData={newLinkData}
                //     getCamera={getCamera}
                // />
            }{
                Object.values(context.nodeContexts).map((nodeContext, nodeIndex) => {
                    const node = nodeContext.ref;
                    let selectionStatus = SelectionStatus.Nothing;
                    if (panelState.selection.includes(node.id)) {
                        selectionStatus = SelectionStatus.Selected;
                    }
                    return (
                        <FlowNodeElement
                            key={node.id}
                            flowId={flowId}
                            panelId={panelId}
                            context={nodeContext}
                            getPanelState={getPanelState}
                            selectionStatus={selectionStatus}
                            env={context.flowEnvironment}
                        />
                    );
                })
            }
        </>
    );
}

export default React.memo(FlowEditorContent);