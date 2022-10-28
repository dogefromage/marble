import { vec2 } from "gl-matrix";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { geometriesNew, selectGeometries } from "../slices/geometriesSlice";
import { createGeometryEditorPanelState, geometryEditorSetGeometryId, selectGeometryEditorPanels } from "../slices/panelGeometryEditorSlice";
import { GeometryS, Point, ViewTypes } from "../types";
import { ViewProps } from "../types/view/ViewProps";
import { pointScreenToWorld } from "../utils/geometries/planarCameraMath";
import { useBindPanelState } from "../utils/panelState/useBindPanelState";
import { usePanelState } from "../utils/panelState/usePanelState";
import GeometryEditorTransform from "./GeometryEditorTransform";
import GeometryTemplateSearcher from "./GeometryTemplateSearcher";

const EditorWrapper = styled.div`

    width: 100%;
    height: 100%;
    user-select: none;
`;

const TEST_GEOMETRY_ID = '1234';

const GeometryEditor = (viewProps: ViewProps) =>
{
    const dispatch = useAppDispatch();

    // ensures state exists for this panel component
    useBindPanelState(
        viewProps.panelId,
        createGeometryEditorPanelState,
        ViewTypes.GeometryEditor,
    );

    // binds geometryId to this panelState
    const panelState = usePanelState(selectGeometryEditorPanels, viewProps.panelId);
    useEffect(() =>
    {
        if (!panelState?.geometryId)
        {
            dispatch(geometryEditorSetGeometryId({
                panelId: viewProps.panelId,
                geometryId: TEST_GEOMETRY_ID,
            }))
        }
    }, [ panelState?.geometryId ]);

    // get bound geometry state using bound geometryId
    const geometryId = panelState?.geometryId;
    const geometryS: GeometryS | undefined = useAppSelector(selectGeometries)[geometryId!];

    const [ showSearcher, setShowSearcher ] = useState<{
        pagePos: Point;
        worldPos: Point;
    }>();

    const openSearcher = (e: React.MouseEvent) =>
    {
        if (!panelState) return;

        const pagePos = {
            x: e.pageX,
            y: e.pageY,
        };

        const boundingRect = e.currentTarget.getBoundingClientRect();
        const offsetPos = vec2.fromValues(
            e.clientX - boundingRect.left, 
            e.clientY - boundingRect.top
        );
        
        const worldPos = pointScreenToWorld(panelState?.camera, offsetPos);

        setShowSearcher({
            pagePos,
            worldPos: { x: worldPos[0], y: worldPos[1] },
        });
    }

    return (
        <EditorWrapper
            onDoubleClick={openSearcher}
        >
        {
            geometryId && 
            <GeometryEditorTransform
                geometryId={geometryId}
                viewProps={viewProps}
            />
        }
        {
            geometryId && showSearcher && 
            <GeometryTemplateSearcher 
                geometryId={geometryId}
                menuPosition={showSearcher.pagePos}
                nodeSpawnPosition={showSearcher.worldPos}
                onClose={() => setShowSearcher(undefined)}
            />
        }
        {
            // only for testing
            geometryId && !geometryS &&
            <button
                onClick={() =>
                {
                    dispatch(geometriesNew({
                        geometryId,
                        undo: {},
                    }));
                }}
            >
                Create geometry
            </button>
        }
        </EditorWrapper>
    )
}

export default GeometryEditor;
