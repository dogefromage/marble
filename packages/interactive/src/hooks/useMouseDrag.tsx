import React, { useRef, useState } from "react";
import { Dragzone } from "../components/Dragzone";

export function useMouseDrag(props:
    {
        mouseButton?: number,
        deadzone?: number,
        start?: (e: React.MouseEvent, cancel: () => void) => void;
        move?: (e: React.MouseEvent) => void;
        end?: (e: React.MouseEvent) => void;
        cursor?: string;
    })
{
    const [ dragging, setDragging ] = useState(false);
    const moveRef = useRef({
        mouseDown: false,
        startPos: {
            x: 0,
            y: 0,
        }
    });

    const start = (e: React.MouseEvent) =>
    {
        if (props.mouseButton && e.button !== props.mouseButton)
            return;

        let out = { cancel: false };
        props.start?.(e, () => { out.cancel = true });
        if (out.cancel) return;

        moveRef.current.mouseDown = true;
        moveRef.current.startPos = { x: e.clientX, y: e.clientY };
    };

    const moveFirst = (e: React.MouseEvent) =>
    {
        if (moveRef.current.mouseDown)
        {
            const deltaMove = Math.hypot(
                moveRef.current.startPos.x - e.clientX,
                moveRef.current.startPos.y - e.clientY,
            );

            if (props.deadzone && deltaMove < props.deadzone)
                return;

            setDragging(true);
            moveRef.current.mouseDown = false;
        }
    }

    const cancel = (e: React.MouseEvent) =>
    {
        moveRef.current.mouseDown = false;
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