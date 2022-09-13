import { AnyAction, EnhancedStore } from '@reduxjs/toolkit';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import GeometryEditorView from '../../app/components/GeometryEditorView';
import { initStore, RootState } from '../../app/redux/store';
import { DragzonePortalMount } from '@marble/interactive';

interface Props
{

}

const ProjectPage = ({ }: Props) =>
{
    const [ store, setStore ] = useState<EnhancedStore<RootState, AnyAction>>();

    useEffect(() =>
    {
        setStore(initStore());
    }, [])

    return (
        store &&
        <Provider store={store}>
            <div className='geometry-wrapper'>
                <GeometryEditorView panelId='1234' />
            </div>
            <DragzonePortalMount />
        </Provider>
    );
}

export default ProjectPage;