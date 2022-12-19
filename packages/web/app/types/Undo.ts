import { PayloadAction } from "@reduxjs/toolkit";

export interface UndoHistory<T>
{
    past: T[];
    present: T;
    future: T[];
    lastStackToken?: string;
}

export const MAX_LENGTH = 50;

export type UndoAction<P extends {} = {}> = PayloadAction<P & {
    undo: {
        actionToken?: string;
        doNotRecord?: boolean;
    }
}>;