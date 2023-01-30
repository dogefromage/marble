import React, { useEffect } from "react";
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";
import { useAppDispatch } from "../redux/hooks";
import { createGeometryEditorPanelState, geometryEditorPanelsSetGeometryId } from "../slices/panelGeometryEditorSlice";
import { ViewProps, ViewTypes } from "../types/panelManager/views";
import { useBindPanelState } from "../utils/panelManager";
import { TEST_ROOT_GEOMETRY_ID } from "../utils/testSetup";
import GeometryEditorInspector from "./GeometryEditorInspector";
import GeometryEditorViewport from "./GeometryEditorViewport";
import PanelBody from "./PanelBody";

const GeometryEditorView = (viewProps: ViewProps) => {
    const dispatch = useAppDispatch();
    const { panelId } = viewProps;

    useBindPanelState(
        panelId,
        createGeometryEditorPanelState,
        ViewTypes.GeometryEditor,
    );
    
    ////////////////// TESTING //////////////////
    useEffect(() => {
        dispatch(geometryEditorPanelsSetGeometryId({
            panelId: panelId,
            geometryId: TEST_ROOT_GEOMETRY_ID,
        }));
    }, []);
    /////////////////////////////////////////////

    return (
        <PanelBody viewProps={viewProps}>
            {/* <PanelBar /> */}
            <ReflexContainer orientation='vertical'>
                <ReflexElement>
                    <GeometryEditorViewport panelId={panelId} />
                </ReflexElement>
                <ReflexSplitter />
                <ReflexElement size={400}>
                    <GeometryEditorInspector panelId={panelId} />
                </ReflexElement>
            </ReflexContainer>
        </PanelBody>
    )
}

export default GeometryEditorView;
