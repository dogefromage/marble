import React, { useEffect } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { selectPanelState } from "../enhancers/panelStateEnhancer";
import useContextMenu from "../utils/contextMenu/useContextMenu";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { geometriesCreate, selectSingleGeometry } from "../slices/geometriesSlice";
import { layersCreate } from "../slices/layersSlice";
import { createGeometryEditorPanelState, geometryEditorPanelsOpenTemplateCatalog, geometryEditorPanelsSetGeometryId } from "../slices/panelGeometryEditorSlice";
import { useBindPanelState } from "../utils/panelManager";
import { TEST_LAYER_ID, TEST_ROOT_GEOMETRY_ID } from "../utils/testSetup";
import GeometryEditorTransform from "./GeometryEditorTransform";
import GeometryTemplateCatalog from "./GeometryTemplateCatalog";
import PanelBody from "./PanelBody";
import { ROOT_GEOMETRY_TEMPLATE } from "../types";
import { ViewProps, ViewTypes } from "../types/panelManager/views";

const EditorWrapper = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    user-select: none;
`;

const TestButton = styled.button`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%);
    font-size: 25px;
`

const GeometryEditorView = (viewProps: ViewProps) =>
{
    const dispatch = useAppDispatch();

    // ensures state exists for this panel component
    useBindPanelState(
        viewProps.panelId,
        createGeometryEditorPanelState,
        ViewTypes.GeometryEditor,
    );

    // binds geometryId to this panelState
    const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, viewProps.panelId));
    useEffect(() =>
    {
        if (!panelState?.geometryId)
        {
            dispatch(geometryEditorPanelsSetGeometryId({
                panelId: viewProps.panelId,
                geometryId: TEST_ROOT_GEOMETRY_ID,
            }));
        }
    }, [ panelState?.geometryId ]);

    // get bound geometry state using bound geometryId
    const geometryId = panelState?.geometryId;
    const geometryS = useAppSelector(selectSingleGeometry(geometryId!));

    const getOffsetPos = (e: React.MouseEvent) =>
    {
        const boundingRect = e.currentTarget.getBoundingClientRect();
        const offsetPos = {
            x: e.clientX - boundingRect.left, 
            y: e.clientY - boundingRect.top,
        };

        return offsetPos;
    }

    const contextMenu = useContextMenu(
        viewProps.panelId,
        'Geometry Nodes', [ 
            'geometryEditor.openTemplateCatalog',
            'geometryEditor.deleteSelected', 
            'geometryEditor.resetSelected',
            'geometryEditor.createSubgeometry'
        ],
        e => ({ offsetPos: getOffsetPos(e) }),
    );

    return (
        <PanelBody
            viewProps={viewProps}
        >
            <EditorWrapper
                onDoubleClick={e => {
                    dispatch(geometryEditorPanelsOpenTemplateCatalog({
                        panelId: viewProps.panelId,
                        center: false,
                        offsetPos: getOffsetPos(e),
                    }));
                }}
                onContextMenu={contextMenu}
            >
            {
                geometryId && 
                <GeometryEditorTransform
                    geometryId={geometryId}
                    panelId={viewProps.panelId}
                />
            }
            {
                geometryS && panelState?.templateCatalog &&
                <GeometryTemplateCatalog 
                    panelId={viewProps.panelId}
                />
            }
            {
                // only for testing
                geometryId && !geometryS &&
                <TestButton
                    onClick={() =>
                    {
                        const actionToken = uuidv4();
                        dispatch(layersCreate({
                            id: TEST_LAYER_ID,
                            rootGeometryId: TEST_ROOT_GEOMETRY_ID,
                            undo: { actionToken },
                        }))
                        dispatch(geometriesCreate({
                            geometryId,
                            geometryTemplate: ROOT_GEOMETRY_TEMPLATE,
                            undo: { actionToken },
                        }));
                    }}
                >
                    Create geometry
                </TestButton>
            }
            </EditorWrapper>
        </PanelBody>
    )
}

export default GeometryEditorView;
