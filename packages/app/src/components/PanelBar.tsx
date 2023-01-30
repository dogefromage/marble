import React, { ReactNode } from 'react';
import styled from 'styled-components';

const PanelBarDiv = styled.div`
    width: 100%;
    height: 1rem;
    border-bottom: solid 1px black;
    background-color: #858585;
`;

interface Props {
    children?: ReactNode;
}

const PanelBar = ({ children }: Props) => {
    return (
        <PanelBarDiv>
            {children}
        </PanelBarDiv>
    );
}

export default PanelBar;