import React from 'react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import FlowEditorView from './FlowEditorView';
import ViewportView from './ViewportView';

const LayoutViewRoot = () => {
    return (
        <ReflexContainer
            orientation='horizontal'
        >
            <ReflexElement>
                <ViewportView panelId='4321' />
            </ReflexElement>
            <ReflexSplitter />
            <ReflexElement>
                <FlowEditorView panelId='1234' />
            </ReflexElement>
        </ReflexContainer>
    );
}

export default LayoutViewRoot;