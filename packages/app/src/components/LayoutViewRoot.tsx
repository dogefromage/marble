import React from 'react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { useAppDispatch } from '../redux/hooks';
import ConsoleView from './ConsoleView';
import GeometryEditorView from './GeometryEditorView';
import ViewportView from './ViewportView';

const LayoutViewRoot = () => {
    return (
        <ReflexContainer
            orientation='horizontal'
        >
            <ReflexElement>
                {/* <ReflexContainer
                    orientation='vertical'
                >
                    <ReflexElement
                        flex={2}
                    > */}
                        <ViewportView panelId='4321' />
                    {/* </ReflexElement>
                    <ReflexSplitter />
                    <ReflexElement
                        flex={1}
                    >
                        <ConsoleView panelId='1432134' />
                    </ReflexElement>
                </ReflexContainer> */}
            </ReflexElement>
            <ReflexSplitter />
            <ReflexElement>
                <GeometryEditorView panelId='1234' />
            </ReflexElement>
        </ReflexContainer>
    );
}

export default LayoutViewRoot;