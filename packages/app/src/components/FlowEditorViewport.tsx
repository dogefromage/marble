import React from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { flowsCreate, selectSingleFlow } from '../slices/flowsSlice';
import { layersCreate } from '../slices/layersSlice';
import { UndoRecord, ViewTypes } from '../types';
import { topFlowSignature } from '../types/flows';
import useDispatchCommand from '../utils/commands/useDispatchCommand';
import useContextMenu from '../utils/menus/useContextMenu';
import { TEST_LAYER_ID } from '../utils/testSetup';
import FlowEditorBreadCrumbs from './FlowEditorBreadCrumbs';
import FlowEditorTransform from './FlowEditorTransform';
import FlowNodeCatalog from './FlowNodeCatalog';

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

const FlowEditorViewport = ({ panelId }: Props) => {
    const dispatch = useAppDispatch();
    const panelState = useAppSelector(selectPanelState(ViewTypes.FlowEditor, panelId));
    const flowId = panelState?.flowStack[0];
    const geometry = useAppSelector(selectSingleFlow(flowId!));
    const dispatchCommand = useDispatchCommand();

    const contextMenu = useContextMenu(
        panelId,
        'Geometry Nodes',
        [
            'flowEditor.addNodeAtPosition',
            'flowEditor.deleteSelected',
            // 'geometryEditor.resetSelected',
            // 'geometryEditor.createSubgeometry'
        ]
    );

    return (
        <EditorWrapper
            onDoubleClick={e => {
                dispatchCommand(
                    'flowEditor.addNodeAtPosition', 
                    { clientCursor: { x: e.clientX, y: e.clientY } },
                    'view',
                );
            }}
            onContextMenu={contextMenu}
        >
            {
                flowId &&
                <FlowEditorTransform
                    panelId={panelId}
                    flowId={flowId}
                />
            }
            <FlowEditorBreadCrumbs
                panelId={panelId}
                flowStack={panelState?.flowStack || []}
            />
            <FlowNodeCatalog
                panelId={panelId}
            />
            {
                // only for testing
                flowId && !geometry &&
                <TestButton
                    onClick={() => {
                        const record: UndoRecord = {
                            actionToken: uuidv4(),
                            desc: `Created test geometry.`,
                        }
                        dispatch(layersCreate({
                            id: TEST_LAYER_ID,
                            entryFlowId: flowId,
                            undo: record,
                        }));
                        dispatch(flowsCreate({
                            flowId,
                            name: 'Test flow',
                            signature: topFlowSignature,
                            undo: record,
                        }));
                    }}
                >
                    Create flow
                </TestButton>
            }
        </EditorWrapper>
    );
}

export default FlowEditorViewport;