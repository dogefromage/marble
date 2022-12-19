import { DragzonePortalMount } from '@marble/interactive';
import { AnyAction, EnhancedStore } from '@reduxjs/toolkit';
import { glMatrix } from 'gl-matrix';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';
import { initStore, RootState } from '../redux/store';
import ContextMenu from './ContextMenu';
import { ContextMenuPortalMount } from './ContextMenuPortalMount';
import DefaultTemplateLoader from './DefaultTemplateLoader';
import { ErrorBoundary } from './ErrorBoundary';
import ErrorDisplay from './ErrorDisplay';
import GeometryEditorView from './GeometryEditorView';
import KeyboardCommandListener from './KeyboardCommandListener';
import SceneProgramCompiler from './SceneProgramCompiler';
import ViewportView from './ViewportView';
import {
  ReflexContainer,
  ReflexSplitter,
  ReflexElement
} from 'react-reflex'
import 'react-reflex/styles.css'
import ConsoleView from './ConsoleView';
import StartAnouncer from './StartAnouncer';
import ServiceErrorBoundary from './ServiceErrorBoundary';

glMatrix.setMatrixArrayType(Array);

const Wrapper = styled.div`
  
    width: 100%;
    height: 100vh;
    /* display: flex;
    flex-direction: column;
    overflow: hidden; */
`;

interface Props
{
    projectId: string;
}

const AppRoot = ({ projectId }: Props) =>
{
    const [ store, setStore ] = useState<EnhancedStore<RootState, AnyAction>>();

    useEffect(() =>
    {
        if (!projectId || store != null) return;
        setStore(initStore());
    }, [ projectId ])

    if (!store) return null;

    return (
        <ErrorBoundary
            fallbackComponent={ErrorDisplay}
        >
            <Provider store={store}>
                {/* Views */}
                <Wrapper
                    onContextMenu={e => e.preventDefault()}
                >
                    <ReflexContainer
                        orientation='horizontal'
                    >
                        <ReflexElement>
                            <ReflexContainer
                                orientation='vertical'
                            >
                                <ReflexElement
                                    flex={2}
                                >
                                    <ViewportView panelId='4321' />
                                </ReflexElement>
                                <ReflexSplitter />
                                <ReflexElement
                                    flex={1}
                                >
                                    <ConsoleView panelId='1432134' />
                                </ReflexElement>
                            </ReflexContainer>
                        </ReflexElement>
                        <ReflexSplitter />
                        <ReflexElement>
                            <GeometryEditorView panelId='1234' />
                        </ReflexElement>
                    </ReflexContainer>
                </Wrapper>
                {/* "Modules" / "Services" */}
                <ServiceErrorBoundary serviceName='SceneProgramCompiler'>
                    <SceneProgramCompiler />
                </ServiceErrorBoundary>
                <DefaultTemplateLoader />
                <KeyboardCommandListener />
                <ContextMenu />
                <StartAnouncer projectId={projectId} />
                {/* Portals */}
                <ContextMenuPortalMount />
                <DragzonePortalMount />
            </Provider>
        </ErrorBoundary>
    )
}

export default AppRoot;