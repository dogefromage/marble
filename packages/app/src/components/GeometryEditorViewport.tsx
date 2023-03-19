import React from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { geometriesCreate, selectSingleGeometry } from '../slices/geometriesSlice';
import { layersCreate } from '../slices/layersSlice';
import { UndoRecord, ViewTypes } from '../types';
import { rootGeometryTemplate } from '../types/geometries/defaultRows';
import useDispatchCommand from '../utils/commands/useDispatchCommand';
import useContextMenu from '../utils/menus/useContextMenu';
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
    const dispatchCommand = useDispatchCommand();

    const contextMenu = useContextMenu(
        panelId, 
        'Geometry Nodes', 
        [
            'geometryEditor.openTemplateCatalog',
            'geometryEditor.deleteSelected',
            'geometryEditor.resetSelected',
            'geometryEditor.createSubgeometry'
        ]
    );

    return (
        <EditorWrapper
            onDoubleClick={e => {
                dispatchCommand(
                    'geometryEditor.openTemplateCatalog', 
                    { clientCursor: { x: e.clientX, y: e.clientY } },
                    'view',
                );
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
                />
            }{
                // only for testing
                geometryId && !geometry &&
                <TestButton
                    onClick={() => {
                        const record: UndoRecord = {
                            actionToken: uuidv4(),
                            desc: `Created test geometry.`,
                        }
                        dispatch(layersCreate({
                            id: TEST_LAYER_ID,
                            rootGeometryId: TEST_ROOT_GEOMETRY_ID,
                            undo: record,
                        }))
                        dispatch(geometriesCreate({
                            geometryId,
                            geometryTemplate: rootGeometryTemplate,
                            undo: record,
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