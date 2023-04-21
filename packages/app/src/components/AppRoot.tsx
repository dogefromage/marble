import { DragzonePortalMount } from '@marble/interactive';
import { AnyAction, EnhancedStore } from '@reduxjs/toolkit';
import { glMatrix } from 'gl-matrix';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import 'react-reflex/styles.css';
import { ThemeProvider } from 'styled-components';
import defaultTheme from '../content/defaultTheme';
import { RootState, initStore } from '../redux/store';
import AssetsManager from './AssetsManager';
import ContextMenu from './ContextMenu';
import { ErrorBoundary } from './ErrorBoundary';
import ErrorDisplay from './ErrorDisplay';
import KeyboardCommandListener from './KeyboardCommandListener';
import LayoutRoot from './LayoutRoot';
import { MenuPortalMount } from './MenuPortalMount';
import StartAnouncer from './StartAnouncer';
import ProgramsManager from './ProgramsManager';

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
                {/* <AssetsManager /> */}
                <ProgramsManager />
                {/* <DependencyManager /> */}
                {/* <TemplateManager staticOnly={false} /> */}
                {/* <GeometryDataManager /> */}

                {/* COMPILATION */}
                {/* <CompilerRoot /> */}
                
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