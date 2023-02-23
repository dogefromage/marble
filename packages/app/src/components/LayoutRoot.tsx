import useResizeObserver from '@react-hook/resize-observer';
import React, { useRef } from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '../redux/hooks';
import { Rect } from '../types';
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

const LayoutRoot = () => {
    const dispatch = useAppDispatch();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useResizeObserver(wrapperRef, observer => {
        const rect: Rect = {
            x: observer.contentRect.x,
            y: observer.contentRect.y,
        }
    });

    return (
        <Wrapper
            onContextMenu={e => e.preventDefault()}
            ref={wrapperRef}
        >
            <LayoutToolbar />
            <LayoutViewRoot />
        </Wrapper>
    );
}

export default LayoutRoot;