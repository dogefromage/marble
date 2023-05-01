import React, { useEffect } from "react";
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { createFlowEditorPanelState, flowEditorPanelsSetFlowId } from "../slices/panelFlowEditorSlice";
import { ROOT_FLOW_ID } from "../types/flows/setup";
import { ViewProps, ViewTypes } from "../types/panelManager/views";
import { useBindPanelState } from "../utils/panelManager";
import FlowEditorViewport from "./FlowEditorViewport";
import PanelBody from "./PanelBody";
import FlowNavigatorBar from "./FlowNavigatorBar";

const FlowEditorView = (viewProps: ViewProps) => {
    const dispatch = useAppDispatch();
    const { panelId } = viewProps;
    const panelState = useAppSelector(selectPanelState(ViewTypes.FlowEditor, panelId));

    useBindPanelState(
        panelId,
        createFlowEditorPanelState,
        ViewTypes.FlowEditor,
    );

    useEffect(() => {
        if (panelState?.flowStack && panelState.flowStack.length === 0) {
            dispatch(flowEditorPanelsSetFlowId({
                panelId: panelId,
                flowId: ROOT_FLOW_ID,
            }));
        }
    }, [panelState?.flowStack])

    return (
        <PanelBody viewProps={viewProps}>
            <FlowNavigatorBar panelId={panelId} />
            <FlowEditorViewport panelId={panelId} />
            {/* <ReflexContainer orientation='vertical'>
                <ReflexElement>
                </ReflexElement>
                <ReflexSplitter />
                <ReflexElement size={400}>
                    <GeometryEditorInspector panelId={panelId} />
                </ReflexElement>
            </ReflexContainer> */}
        </PanelBody>
    )
}

export default FlowEditorView;
