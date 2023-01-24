import React from "react";

interface Props {
    children: React.ReactNode;
    fallbackComponent: (props: { error: Error }) => JSX.Element | null;
}

interface State {
    error?: Error;
}

export class ErrorBoundary extends React.Component<Props>
{
    state: State = {};

    componentDidCatch(error: Error) {
        this.setState({ error: { name: error.name, message: error.message } });
    }

    render() {
        const { error } = this.state;
        const ErrorBoundary = this.props.fallbackComponent;
        if (error) return <ErrorBoundary error={error} />;

        return this.props.children;
    }
}