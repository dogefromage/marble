import React from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectSingleGeometry, geometriesCreate } from '../slices/geometriesSlice';
import { layersCreate } from '../slices/layersSlice';
import { geometryEditorPanelsOpenTemplateCatalog } from '../slices/panelGeometryEditorSlice';
import { rootGeometryTemplate, ViewTypes } from '../types';
import useContextMenu from '../utils/contextMenu/useContextMenu';
import { TEST_LAYER_ID, TEST_ROOT_GEOMETRY_ID } from '../utils/testSetup';
import GeometryEditorBreadCrumbs from './GeometryEditorBreadCrumbs';
import GeometryEditorTransform from './GeometryEditorTransform';
import GeometryTemplateCatalog from './GeometryTemplateCatalog';

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

interface Props {
    panelId: string;
}

const GeometryEditorViewport = ({ panelId }: Props) => {
    const dispatch = useAppDispatch();
    const panelState = useAppSelector(selectPanelState(ViewTypes.GeometryEditor, panelId));
    const geometryId = panelState?.geometryStack[0];
    const geometry = useAppSelector(selectSingleGeometry(geometryId));

    const getOffsetPos = (e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect();
        const offsetPos = {
            x: e.clientX - boundingRect.left,
            y: e.clientY - boundingRect.top,
        };

        return offsetPos;
    }

    const contextMenu = useContextMenu(
        panelId, 'Geometry Nodes', [
            'geometryEditor.openTemplateCatalog',
            'geometryEditor.deleteSelected',
            'geometryEditor.resetSelected',
            'geometryEditor.createSubgeometry'
        ], 
        e => ({ offsetPos: getOffsetPos(e) })
    );


    return (
        <EditorWrapper
            onDoubleClick={e => {
                dispatch(geometryEditorPanelsOpenTemplateCatalog({
                    panelId: panelId,
                    center: false,
                    offsetPos: getOffsetPos(e),
                }));
            }}
            onContextMenu={contextMenu}
        >
            {
                geometryId &&
                <GeometryEditorTransform
                    panelId={panelId}
                    geometryId={geometryId}
                />
            }
            <GeometryEditorBreadCrumbs
                panelId={panelId}
                geometryStack={panelState?.geometryStack || []}
            />
            {
                geometryId && panelState?.templateCatalog &&
                <GeometryTemplateCatalog
                    panelId={panelId}
                    geometryId={geometryId}
                    templateCatalog={panelState.templateCatalog}
                />
            }{
                // only for testing
                geometryId && !geometry &&
                <TestButton
                    onClick={() => {
                        const actionToken = uuidv4();
                        dispatch(layersCreate({
                            id: TEST_LAYER_ID,
                            rootGeometryId: TEST_ROOT_GEOMETRY_ID,
                            undo: { actionToken },
                        }))
                        dispatch(geometriesCreate({
                            geometryId,
                            geometryTemplate: rootGeometryTemplate,
                            undo: { actionToken },
                        }));
                    }}
                >
                    Create geometry
                </TestButton>
            }
        </EditorWrapper>
    );
}

export default GeometryEditorViewport;