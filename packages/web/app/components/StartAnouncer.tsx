import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { consoleAppendMessage } from '../slices/consoleSlice';

interface Props
{
    projectId: string;
}

const StartAnouncer = ({ projectId }: Props) =>
{
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(consoleAppendMessage({
            text: `Project ${projectId} loaded.`,
        }))
    }, []);

    return null;
}

export default StartAnouncer;