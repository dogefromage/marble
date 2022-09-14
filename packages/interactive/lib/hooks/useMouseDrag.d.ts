import React from "react";
export declare function useMouseDrag(props: {
    mouseButton?: number;
    deadzone?: number;
    start?: (e: React.MouseEvent, cancel: () => void) => void;
    move?: (e: React.MouseEvent) => void;
    end?: (e: React.MouseEvent) => void;
    cursor?: string;
}): {
    handlers: {
        onMouseDown: (e: React.MouseEvent) => void;
        onMouseMove: (e: React.MouseEvent) => void;
        onMouseUp: (e: React.MouseEvent) => void;
    };
    catcher: JSX.Element | null;
};
