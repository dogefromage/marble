import { PayloadAction } from "@reduxjs/toolkit";

export interface UndoHistory<T>
{
    past: T[];
    present: T;
    future: T[];
    lastStackToken?: string;
}

export const MAX_LENGTH = 50;

export type UndoAction<P extends any> = PayloadAction<P & {
    undo: {
        stackToken?: string;
        doNotRecord?: boolean;
    }
}>;