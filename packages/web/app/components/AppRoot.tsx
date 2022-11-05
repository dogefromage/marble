import { DragzonePortalMount } from '@marble/interactive';
import { EnhancedStore, AnyAction } from '@reduxjs/toolkit';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';
import { RootState, initStore } from '../redux/store';
import ViewportView from './ViewportView';
import { glMatrix } from 'gl-matrix';
import GeometryEditorView from './GeometryEditorView';
import SceneProgramCompiler from './SceneProgramCompiler';
import DefaultTemplateLoader from './DefaultTemplateLoader';
import KeyboardCommandListener from './KeyboardCommandListener';
import { ContextMenuPortalMount } from './ContextMenuPortalMount';
import ContextMenu from './ContextMenu';
import { AppErrorBoundary } from './AppErrorBoundary';

glMatrix.setMatrixArrayType(Array);

const Wrapper = styled.div`
  
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
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
            <AppErrorBoundary>
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
            </AppErrorBoundary>
        ) : null
    );
}

export default AppRoot;