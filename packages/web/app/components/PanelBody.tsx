import { useCallback, useRef } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { panelManagerSetActive } from '../slices/panelManagerSlice';
import PanelDiv from '../styled/panel';
import { ViewProps } from '../types';
import { ErrorBoundary } from './ErrorBoundary';
import ErrorDisplay from './ErrorDisplay';

interface Props
{
    children: JSX.Element;
    viewProps: ViewProps;
}

const PanelBody = ({ children, viewProps: { panelId } }: Props) =>
{
    const dispatch = useAppDispatch();
    const panelDiv = useRef<HTMLDivElement>(null);

    const mouseEnter = useCallback(() => {
        if (!panelDiv.current) return;
        const rect = panelDiv.current.getBoundingClientRect();
        dispatch(panelManagerSetActive({
            activePanel: { 
                panelId,
                panelClientRect: {
                    x: rect.left,
                    y: rect.top,
                    w: rect.width,
                    h: rect.height,
                },
            },
        }))
    }, [ dispatch ]);

    return (
        <PanelDiv
            ref={panelDiv}
            onMouseEnter={mouseEnter}
        >
            <ErrorBoundary
                fallbackComponent={ErrorDisplay}
            >
                { children }
            </ErrorBoundary>
        </PanelDiv>
    );
}

export default PanelBody;