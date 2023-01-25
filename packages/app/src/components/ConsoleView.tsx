import React from 'react';
import { useEffect, useRef } from 'react';
import useContextMenu from '../utils/contextMenu/useContextMenu';
import { useAppSelector } from '../redux/hooks';
import { selectConsole } from '../slices/consoleSlice';
import { ConsoleDiv, ConsoleMessageP } from '../styles/console';
import PanelBody from './PanelBody';
import { ViewProps } from '../types/panelManager/views';

function formatConsoleTime(time: number) {
    const date = new Date(time);

    return [ date.getHours(), date.getMinutes(), date.getSeconds()]
        .map(t => t.toString().padStart(2, '0'))
        .join(':');
}

const ConsoleView = (viewProps: ViewProps) =>
{
    const consoleState = useAppSelector(selectConsole);
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!divRef.current) return;
        divRef.current.scrollTop = divRef.current.scrollHeight;
    }, [ consoleState.feed ]);

    const onContext = useContextMenu(viewProps.panelId, 'Console', [ 'console.clearMessages' ]);

    return (
        <PanelBody
            viewProps={viewProps}
        >
            <ConsoleDiv
                ref={divRef}
                onContextMenu={onContext}
            >
            {
                consoleState.feed.map(msg =>
                    <ConsoleMessageP
                        key={msg.id}
                        type={msg.type}
                    >
                        { `<${formatConsoleTime(msg.time)}> ${msg.text}` }
                    </ConsoleMessageP>
                )
            }
            </ConsoleDiv>
        </PanelBody>
    );
}

export default ConsoleView;