import React from 'react';
import styled from 'styled-components';

const ErrorDisplayDiv = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: none;

    background-color: #acacac66;

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
    error: Error;
}

const ErrorDisplay = ({ error }: Props) =>
{
    return (
        <ErrorDisplayDiv>
            <div>
                <h1>{ "An error occured :(" }</h1>
                <p>{ error.message }</p>
            </div>
        </ErrorDisplayDiv>

    );
}

export default ErrorDisplay;