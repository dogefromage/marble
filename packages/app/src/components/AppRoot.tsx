import { DragzonePortalMount } from '@marble/interactive';
import { AnyAction, EnhancedStore } from '@reduxjs/toolkit';
import { glMatrix } from 'gl-matrix';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import 'react-reflex/styles.css';
import { ThemeProvider } from 'styled-components';
import defaultTheme from '../content/defaultTheme';
import { RootState, initStore } from '../redux/store';
import ContextMenu from './ContextMenu';
import KeyboardCommandListener from './KeyboardCommandListener';
import LayoutRoot from './LayoutRoot';
import { MenuPortalMount } from './MenuPortalMount';
import ProjectManager from './ProjectManager';
import ProjectLoader from './ProjectLoader';

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
        <Provider store={store}>
            {/* APP STATE */}
            <ProjectManager />
            <ProjectLoader />
            {/* Views */}
            <ThemeProvider theme={defaultTheme}>
                <LayoutRoot />
            </ThemeProvider>
            {/* USER INTERACTION */}
            <KeyboardCommandListener />
            <ContextMenu />
            {/* PORTAL MOUNTS */}
            <MenuPortalMount />
            <DragzonePortalMount />
        </Provider>
    )
}

export default AppRoot;