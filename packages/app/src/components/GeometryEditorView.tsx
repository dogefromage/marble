import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { selectPanelState } from "../enhancers/panelStateEnhancer";
import useContextMenu from "../hooks/useContextMenu";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { geometriesNew, selectGeometry } from "../slices/geometriesSlice";
import { createGeometryEditorPanelState, geometryEditorPanelsOpenTemplateCatalog, geometryEditorPanelsSetGeometryId } from "../slices/panelGeometryEditorSlice";
import { panelManagerSetActive } from "../slices/panelManagerSlice";
import { ViewTypes } from "../types";
import { ViewProps } from "../types/view/ViewProps";
import { useBindPanelState } from "../utils/panelState/useBindPanelState";
import GeometryEditorTransform from "./GeometryEditorTransform";
import GeometryTemplateCatalog from "./GeometryTemplateCatalog";
import PanelBody from "./PanelBody";

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

const TEST_GEOMETRY_ID = '1234';

const GeometryEditorView = (viewProps: ViewProps) =>
{
    const dispatch = useAppDispatch();

    const viewBoundingRect = useRef<HTMLDivElement>(null);

    /**
     * !!!!!!!!!! ONLY FOR TESTING
     */
    useEffect(() =>
    {
        if (!viewBoundingRect.current) return;
        const boundingRect = viewBoundingRect.current.getBoundingClientRect();

        dispatch(panelManagerSetActive({
            activePanel: {
                panelId: viewProps.panelId,
                panelClientRect: {
                    x: boundingRect.left,
                    y: boundingRect.top,
                    w: boundingRect.width,
                    h: boundingRect.height,
                },
            }
        }))
    }, []);

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
                geometryId: TEST_GEOMETRY_ID,
            }))
        }
    }, [ panelState?.geometryId ]);

    // get bound geometry state using bound geometryId
    const geometryId = panelState?.geometryId;
    const geometryS = useAppSelector(selectGeometry(geometryId!));

    const getOffsetPos = (e: React.MouseEvent) =>
    {
        const boundingRect = e.currentTarget.getBoundingClientRect();
        const offsetPos = {
            x: e.clientX - boundingRect.left, 
            y: e.clientY - boundingRect.top,
        };

        return offsetPos;
    }

    const openSearcher = (e: React.MouseEvent) =>  
        dispatch(geometryEditorPanelsOpenTemplateCatalog({
            panelId: viewProps.panelId,
            center: false,
            offsetPos: getOffsetPos(e),
        }));

    const contextMenu = useContextMenu(
        viewProps.panelId,
        'Geometry Nodes', [ 
            'geometryEditor.openTemplateCatalog',
            'geometryEditor.deleteSelected', 
            'geometryEditor.resetSelected',
        ],
        e => ({ offsetPos: getOffsetPos(e) }),
    )

    return (
        <PanelBody
            viewProps={viewProps}
        >
            <EditorWrapper
                onDoubleClick={openSearcher}
                onContextMenu={contextMenu}
                ref={viewBoundingRect}
            >
            {
                geometryId && 
                <GeometryEditorTransform
                    geometryId={geometryId}
                    panelId={viewProps.panelId}
                />
            }
            {
                geometryS &&
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
                        dispatch(geometriesNew({
                            geometryId,
                            undo: {},
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
