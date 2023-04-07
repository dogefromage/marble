import React, { useEffect } from "react";
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";
import { useAppDispatch } from "../redux/hooks";
import { ViewProps, ViewTypes } from "../types/panelManager/views";
import { useBindPanelState } from "../utils/panelManager";
import { TEST_ROOT_FLOW_ID } from "../utils/testSetup";
import GeometryEditorInspector from "./GeometryEditorInspector";
import FlowEditorViewport from "./FlowEditorViewport";
import PanelBody from "./PanelBody";
import { createFlowEditorPanelState, flowEditorPanelsSetFlowId } from "../slices/panelFlowEditorSlice";

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
