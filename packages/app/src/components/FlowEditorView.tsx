import React, { useEffect } from "react";
import { useAppDispatch } from "../redux/hooks";
import { createFlowEditorPanelState, flowEditorPanelsSetFlowId } from "../slices/panelFlowEditorSlice";
import { ViewProps, ViewTypes } from "../types/panelManager/views";
import { useBindPanelState } from "../utils/panelManager";
import { TEST_ROOT_FLOW_ID } from "../utils/testSetup";
import FlowEditorViewport from "./FlowEditorViewport";
import PanelBody from "./PanelBody";

const FlowEditorView = (viewProps: ViewProps) => {
    const dispatch = useAppDispatch();
    const { panelId } = viewProps;

    useBindPanelState(
        panelId,
        createFlowEditorPanelState,
        ViewTypes.FlowEditor,
    );
    
    ////////////////// TESTING //////////////////
    useEffect(() => {
        dispatch(flowEditorPanelsSetFlowId({
            panelId: panelId,
            flowId: TEST_ROOT_FLOW_ID,
        }));
    }, []);
    /////////////////////////////////////////////

    return (
        <PanelBody viewProps={viewProps}>
            {/* <PanelBar /> */}
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
