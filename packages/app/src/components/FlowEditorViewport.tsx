import React from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { ViewTypes } from '../types';
import useDispatchCommand from '../utils/commands/useDispatchCommand';
import useContextMenu from '../utils/menus/useContextMenu';
import FlowEditorTransform from './FlowEditorTransform';
import FlowNodeCatalog from './FlowNodeCatalog';
import { selectPanelState } from '../enhancers/panelStateEnhancer';
import { BOX_SHADOW } from '../styles/utils';

const EditorWrapper = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    user-select: none;
`;

interface Props {
    panelId: string;
}

const FlowEditorViewport = ({ panelId }: Props) => {
    const dispatch = useAppDispatch();
    const panelState = useAppSelector(selectPanelState(ViewTypes.FlowEditor, panelId));
    const currFlowId = panelState?.flowStack[0];
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
                currFlowId &&
                <FlowEditorTransform
                    panelId={panelId}
                    flowId={currFlowId}
                />
            }
            <FlowNodeCatalog
                panelId={panelId}
            />
        </EditorWrapper>
    );
}

export default FlowEditorViewport;