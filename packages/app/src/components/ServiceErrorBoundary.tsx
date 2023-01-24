import React, { useEffect } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { consoleAppendMessage } from '../slices/consoleSlice';
import { ErrorBoundary } from './ErrorBoundary';

const ServiceErrorFallback = (serviceName: string) => ({ error }: { error: Error }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(consoleAppendMessage({
            text: `Error in ${serviceName}: ${error.message}`,
            type: 'error',
        }));
    }, [ error, serviceName ]);

    return null;
}

interface Props {
    serviceName: string;
    children: React.ReactNode;
}

const ServiceErrorBoundary = ({ serviceName, children }: Props) => {
    return (
        <ErrorBoundary
            fallbackComponent={ServiceErrorFallback(serviceName)}
        >
            {children}
        </ErrorBoundary>
    );
}

export default ServiceErrorBoundary;