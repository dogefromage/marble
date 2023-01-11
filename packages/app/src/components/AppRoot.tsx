import { DragzonePortalMount } from '@marble/interactive';
import { AnyAction, EnhancedStore } from '@reduxjs/toolkit';
import { glMatrix } from 'gl-matrix';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import 'react-reflex/styles.css';
import { ThemeProvider } from 'styled-components';
import defaultTheme from '../assets/defaultTheme';
import { initStore, RootState } from '../redux/store';
import ContextMenu from './ContextMenu';
import { ContextMenuPortalMount } from './ContextMenuPortalMount';
import DefaultTemplateLoader from './DefaultTemplateLoader';
import { ErrorBoundary } from './ErrorBoundary';
import ErrorDisplay from './ErrorDisplay';
import KeyboardCommandListener from './KeyboardCommandListener';
import LayoutRoot from './LayoutRoot';
import StartAnouncer from './StartAnouncer';

glMatrix.setMatrixArrayType(Array);

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
                <ThemeProvider theme={defaultTheme}>
                    <LayoutRoot />
                </ThemeProvider>
                {/* "Modules" / "Services" */}
                {/* <ServiceErrorBoundary serviceName='SceneProgramCompiler'>
                    <CompilerRoot />
                </ServiceErrorBoundary> */}
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