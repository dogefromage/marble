import { DragzonePortalMount } from '@marble/interactive';
import { AnyAction, EnhancedStore } from '@reduxjs/toolkit';
import { glMatrix } from 'gl-matrix';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';
import { initStore, RootState } from '../redux/store';
import ErrorDisplay from './ErrorDisplay';
import ContextMenu from './ContextMenu';
import { ContextMenuPortalMount } from './ContextMenuPortalMount';
import DefaultTemplateLoader from './DefaultTemplateLoader';
import { ErrorBoundary } from './ErrorBoundary';
import GeometryEditorView from './GeometryEditorView';
import KeyboardCommandListener from './KeyboardCommandListener';
import SceneProgramCompiler from './SceneProgramCompiler';
import ViewportView from './ViewportView';

glMatrix.setMatrixArrayType(Array);

const Wrapper = styled.div`
  
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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
        setStore(initStore());
    }, [])

    return (
        store ? 
        (
            <ErrorBoundary
                fallbackComponent={ErrorDisplay}
            >
                <Provider store={store}>
                    {/* Views */}
                    <Wrapper
                        onContextMenu={e => e.preventDefault()}
                    >
                        <ViewportView panelId='4321' />
                        <GeometryEditorView panelId='1234' />
                    </Wrapper>
                    {/* "Modules" / "Services" */}
                    <SceneProgramCompiler />
                    <DefaultTemplateLoader />
                    <KeyboardCommandListener />
                    <ContextMenu />
                    {/* Portals */}
                    <ContextMenuPortalMount />
                    <DragzonePortalMount />
                </Provider>
            </ErrorBoundary>
        ) : null
    );
}

export default AppRoot;