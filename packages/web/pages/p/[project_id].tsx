import { AnyAction, EnhancedStore } from '@reduxjs/toolkit';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import GeometryEditorView from '../../app/components/GeometryEditorView';
import { initStore, RootState } from '../../app/redux/store';
import { DragzonePortalMount } from '@marble/interactive';
import ViewportView from '../../app/components/ViewportView';
import styled from 'styled-components';
import AppRoot from '../../app/components/AppRoot';
import { useRouter } from 'next/router';

const ProjectPage = () =>
{
    const router = useRouter()
    const { project_id } = router.query;

    return (
        <AppRoot projectId={project_id as string} />
    );
}

export default ProjectPage;