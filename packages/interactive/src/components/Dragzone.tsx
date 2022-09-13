import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

interface Props
{
    cursor?: string
}

const DragzoneDiv = styled.div<Props>`
    transform: initial;
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 6969;

    cursor: ${({ cursor }) => cursor || 'inherit' };
`;

export const Dragzone = (props: React.HTMLAttributes<HTMLDivElement> | Props) => 
{
    return ReactDOM.createPortal(
        <DragzoneDiv
            {...props}
        />, 
        document.querySelector(`#dragzone-portal-mount`)!
    );
};