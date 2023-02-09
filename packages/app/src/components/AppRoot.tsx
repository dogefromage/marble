import { DragzonePortalMount } from '@marble/interactive';
import { AnyAction, EnhancedStore } from '@reduxjs/toolkit';
import { glMatrix } from 'gl-matrix';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import 'react-reflex/styles.css';
import { ThemeProvider } from 'styled-components';
import defaultTheme from '../content/defaultTheme';
import { initStore, RootState } from '../redux/store';
import CompilerRoot from './CompilerRoot';
import ContextMenu from './ContextMenu';
import { MenuPortalMount } from './MenuPortalMount';
import TemplateManager from './TemplateManager';
import { ErrorBoundary } from './ErrorBoundary';
import ErrorDisplay from './ErrorDisplay';
import KeyboardCommandListener from './KeyboardCommandListener';
import LayoutRoot from './LayoutRoot';
import ServiceErrorBoundary from './ServiceErrorBoundary';
import StartAnouncer from './StartAnouncer';
import DependencyManager from './DependencyManager';
import GeometryDataManager from './GeometryDataManager';

glMatrix.setMatrixArrayType(Array);

interface Props {
    projectId: string;
}

const AppRoot = ({ projectId }: Props) => {
    const [store, setStore] = useState<EnhancedStore<RootState, AnyAction>>();

    useEffect(() => {
        if (!projectId || store != null) return;
        setStore(initStore());
    }, [projectId])
    if (!store) return null;

    return (
        <ErrorBoundary
            fallbackComponent={ErrorDisplay}
        >
            <Provider store={store}>
                {/* APP STATE */}
                <DependencyManager />
                <TemplateManager staticOnly={true} />
                <GeometryDataManager />
                {/* COMPILATION */}
                <ServiceErrorBoundary serviceName='Program Compiler'>
                    <CompilerRoot />
                </ServiceErrorBoundary>
                {/* Views */}
                <ThemeProvider theme={defaultTheme}>
                    <LayoutRoot />
                </ThemeProvider>
                {/* USER INTERACTION */}
                <KeyboardCommandListener />
                <ContextMenu />
                <StartAnouncer projectId={projectId} />
                {/* PORTAL MOUNTS */}
                <MenuPortalMount />
                <DragzonePortalMount />
            </Provider>
        </ErrorBoundary>
    )
}

export default AppRoot;