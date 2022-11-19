import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import ErrorDisplay from './ErrorDisplay';

interface Props
{
    children: JSX.Element;
}

const PanelBody = ({ children }: Props) =>
{
    return (
        <ErrorBoundary
            fallbackComponent={ErrorDisplay}
        >
            { children }
        </ErrorBoundary>
    );
}

export default PanelBody;