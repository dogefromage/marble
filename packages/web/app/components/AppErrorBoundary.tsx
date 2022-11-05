import React from "react";
import AppErrorDisplay from "./AppErrorDisplay";

interface Props
{
    children: JSX.Element;
}

interface State
{
    error?: string;
}

export class AppErrorBoundary extends React.Component<Props> {

    state: State = {};

    componentDidCatch(error: Error)
    {
        this.setState({ error: `${error.name}: ${error.message}` });
    }

    render()
    {
        const { error } = this.state;

        if (error) return <AppErrorDisplay error={error} />;

        return this.props.children;
    }
}