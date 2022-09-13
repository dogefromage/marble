import React from "react";
export declare function useDroppable<T extends {}>(props: {
    tag: string;
    enter?: (e: React.DragEvent, transfer: T) => void;
    over?: (e: React.DragEvent, transfer: T) => void;
    leave?: (e: React.DragEvent, transfer: T) => void;
    drop?: (e: React.DragEvent, transfer: T) => void;
}): {
    handlers: {
        onDragEnter: (e: React.DragEvent) => void;
        onDragOver: (e: React.DragEvent) => void;
        onDragLeave: (e: React.DragEvent) => void;
        onDrop: (e: React.DragEvent) => void;
    };
    isHovering: boolean;
};
