import React from 'react';
import styled from 'styled-components';

const ErrorDisplayDiv = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: none;

    background-color: #e6434366;

    div
    {
        background-color: white;
        border-radius: 3px;
        box-shadow: 5px 5px #00000066;

        padding: 2rem;
    }
`

interface Props
{
    error: string;
}

const AppErrorDisplay = ({ error }: Props) =>
{
    return (
        <ErrorDisplayDiv>
            <div>
                <h1>:(</h1>
                <p>An error occured and your project could not be displayed.</p>
                <p>{ error }</p>
            </div>
        </ErrorDisplayDiv>

    );
}

export default AppErrorDisplay;