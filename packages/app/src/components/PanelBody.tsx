import useResizeObserver from '@react-hook/resize-observer';
import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '../redux/hooks';
import { panelManagerSetActive, panelManagerSetClientRect } from '../slices/panelManagerSlice';
import { Rect, ViewProps } from '../types';
import { ErrorBoundary } from './ErrorBoundary';
import ErrorDisplay from './ErrorDisplay';

const PanelDiv = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

interface Props {
    children: React.ReactNode;
    viewProps: ViewProps;
}

const PanelBody = ({ children, viewProps: { panelId } }: Props) => {
    const dispatch = useAppDispatch();
    const panelDiv = useRef<HTMLDivElement>(null);

    const mouseEnter = useCallback(() => {
        if (!panelDiv.current) return;
        dispatch(panelManagerSetActive({
            activePanel: panelId,
        }))
    }, [dispatch]);

    useResizeObserver(panelDiv, div => {
        const bounds = div.target.getBoundingClientRect();
        const rect: Rect = {
            x: bounds.left,
            y: bounds.top,
            w: bounds.width,
            h: bounds.height
        }

        dispatch(panelManagerSetClientRect({
            panelId,
            rect,
        }));
    });

    return (
        <PanelDiv
            ref={panelDiv}
            onMouseEnter={mouseEnter}
        >
            <ErrorBoundary
                fallbackComponent={ErrorDisplay}
            >
                {children}
            </ErrorBoundary>
        </PanelDiv>
    );
}

export default PanelBody;