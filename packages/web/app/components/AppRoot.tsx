import { DragzonePortalMount } from '@marble/interactive';
import { EnhancedStore, AnyAction } from '@reduxjs/toolkit';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';
import { RootState, initStore } from '../redux/store';
import ViewportView from './ViewportView';
import { glMatrix } from 'gl-matrix';

glMatrix.setMatrixArrayType(Array);

const Wrapper = styled.div`
  
    width: 100%;
    height: 100vh;
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
                {/* <GeometryEditorView panelId='1234' /> */}
                <ViewportView panelId='4321' />
            </Wrapper>
            <DragzonePortalMount />
        </Provider>
    );
}

export default AppRoot;