import React from "react";
export declare function useDraggable<T extends {}>(props: {
    tag: string;
    start?: (e: React.DragEvent) => T | undefined;
    end?: (e: React.DragEvent) => void;
}): {
    handlers: {
        onDragStart: (e: React.DragEvent) => void;
        onDragEnd: (e: React.DragEvent) => void;
        draggable: boolean;
    };
};
