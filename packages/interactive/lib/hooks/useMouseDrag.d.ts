import React from "react";
interface MouseDragInteraction {
    mouseButton: number;
    start: (e: React.MouseEvent, cancel: () => void) => void;
    move: (e: React.MouseEvent) => void;
    end: (e: React.MouseEvent) => void;
}
interface MouseDragOptions {
    cursor: string;
    deadzone: number;
}
export declare function useMouseDrag(interactions: Partial<MouseDragInteraction> | Partial<MouseDragInteraction>[], options?: Partial<MouseDragOptions>): {
    handlers: {
        onMouseDown: (e: React.MouseEvent) => void;
        onMouseMove: (e: React.MouseEvent) => void;
        onMouseUp: (e: React.MouseEvent) => void;
    };
    catcher: JSX.Element | null;
};
export {};
