import React, { useRef, useState } from "react";
import Dragzone from "../components/Dragzone";

export function useMouseDrag(props:
    {
        mouseButton?: number,
        start?: (e: React.MouseEvent, cancel: () => void) => void;
        move?: (e: React.MouseEvent) => void;
        end?: (e: React.MouseEvent) => void;
        cursor?: string;
    })
{
    const [ dragging, setDragging ] = useState(false);
    const enableMoveRef = useRef(false);

    const start = (e: React.MouseEvent) =>
    {
        if (props.mouseButton && e.button !== props.mouseButton)
            return;

        let out = { cancel: false };
        props.start?.(e, () => { out.cancel = true });
        if (out.cancel) return;

        enableMoveRef.current = true;
    };

    const moveFirst = (e: React.MouseEvent) =>
    {
        if (enableMoveRef.current)
        {
            setDragging(true);
            enableMoveRef.current = false;
        }
    }

    const cancel = (e: React.MouseEvent) =>
    {
        enableMoveRef.current = false;
    }

    const zoneMove = (e: React.MouseEvent) =>
    {
        props.move?.(e);
    }

    const zoneEnd = (e: React.MouseEvent) =>
    {
        props.end?.(e);
        setDragging(false);
    }

    return {
        handlers: {
            onMouseDown: start,
            onMouseMove: moveFirst,
            onMouseUp: cancel,
        },
        catcher: (
            dragging ?
                <Dragzone
                    onMouseMove={zoneMove}
                    onMouseUp={zoneEnd}
                    onMouseLeave={zoneEnd}
                    cursor={props.cursor}
                />
                : null
        )
    }
}