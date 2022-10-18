import { vec2 } from "gl-matrix";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { geometriesNew, selectGeometries } from "../slices/geometriesSlice";
import { createGeometryEditorPanelState, selectGeometryEditorPanels } from "../slices/panelGeometryEditorSlice";
import { selectTemplates } from "../slices/templatesSlice";
import { GeometryS, Point, ViewTypes } from "../types";
import { ViewProps } from "../types/View";
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

const GeometryEditor = (viewProps: ViewProps) =>
{
    useBindPanelState(
        viewProps.panelId,
        createGeometryEditorPanelState,
        ViewTypes.GeometryEditor,
    );

    // const [ geometryId, setGeometryId ] = useState<string>();
    const geometryId = '1234';
    const { templates } = useAppSelector(selectTemplates);

    const dispatch = useAppDispatch();
    const geometryS: GeometryS | undefined = useAppSelector(selectGeometries)[geometryId];

    const panelState = usePanelState(selectGeometryEditorPanels, viewProps.panelId);

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

    useEffect(() =>
    {
        if (!geometryS)
        {
            dispatch(geometriesNew({
                geometryId,
                undo: {},
            }));
        }
    }, []);

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
        </EditorWrapper>
    )
}

export default GeometryEditor;
