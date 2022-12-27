import React from 'react';
import styled from 'styled-components';
import LayoutToolbar from './LayoutToolbar';
import LayoutViewRoot from './LayoutViewRoot';

const Wrapper = styled.div`
    width: 100%;
    height: 100vh;

    display: grid;
    grid-template-rows: auto 1fr;

    & > :first-child {
        border-bottom: solid 1px black;
    }
`;

const LayoutRoot = () =>
{
    return (
        <Wrapper
            onContextMenu={e => e.preventDefault()}
        >
            <LayoutToolbar />
            <LayoutViewRoot />
        </Wrapper>
    );
}

export default LayoutRoot;