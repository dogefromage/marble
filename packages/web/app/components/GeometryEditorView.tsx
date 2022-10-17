import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { geometriesNew, selectGeometries } from "../slices/geometriesSlice";
import { createGeometryEditorPanelState } from "../slices/panelGeometryEditorSlice";
import { selectTemplates } from "../slices/templatesSlice";
import { GeometryS, Point, ViewTypes } from "../types";
import { ViewProps } from "../types/View";
import { useBindPanelState } from "../utils/panelState/useBindPanelState";
import GeometryEditorTransform from "./GeometryEditorTransform";
import GeometryTemplateSearcher from "./GeometryNodeQuickdial";

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

    const [ quickDial, setQuickDial ] = useState<{
        position: Point;
    }>();

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
            onDoubleClick={e =>
            {
                const position = {
                    x: e.pageX,
                    y: e.pageY,
                };
                setQuickDial({
                    position,
                })
            }}
        >
            {
                geometryId && 
                <GeometryEditorTransform
                    geometryId={geometryId}
                    viewProps={viewProps}
                />
            }
        {
            geometryId && quickDial && 
            <GeometryTemplateSearcher 
                geometryId={geometryId}
                position={quickDial.position}
                templates={templates}
                onClose={() => setQuickDial(undefined)}
            />
        }
        </EditorWrapper>
    )
}

export default GeometryEditor;
