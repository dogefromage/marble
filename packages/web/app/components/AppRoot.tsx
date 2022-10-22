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
        store &&
        <Provider store={store}>
            <Wrapper>
                <ViewportView panelId='4321' />
                <GeometryEditorView panelId='1234' />
            </Wrapper>
            <SceneProgramCompiler />
            <DefaultTemplateLoader />
            <KeyboardCommandListener />
            <DragzonePortalMount />
        </Provider>
    );
}

export default AppRoot;