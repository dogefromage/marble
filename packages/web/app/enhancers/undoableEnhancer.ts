import { Reducer } from "@reduxjs/toolkit";
import { MAX_LENGTH, UndoAction, UndoHistory } from "../types/Undo";

enum UndoableActionTypes
{
    Undo = 'undo.undo',
    Redo = 'undo.redo',
}

export const undo = () => ({ type: UndoableActionTypes.Undo, payload: {} });
export const redo = () => ({ type: UndoableActionTypes.Redo, payload: {} });

export default function undoableEnhancer<S, A extends UndoAction>
    (reducer: Reducer<S, A>): Reducer<UndoHistory<S>, A>
{
    const initialState: UndoHistory<S> =
    {
        past: [],
        present: reducer(undefined, {} as A),
        future: [],
    };

    return (state, action: A) =>
    {
        if (state == null) state = initialState;

        const { past, present, future, lastStackToken } = state;

        if (action.type === UndoableActionTypes.Undo)
        {
            const previous = past[past.length - 1];
            if (!previous) return state;
            const newPast = past.slice(0, past.length - 1);

            return {
                past: newPast,
                present: previous,
                future: [ present, ...future ]
            }
        }
        if (action.type === UndoableActionTypes.Redo)
        {
            const next = future[0]
            if (!next) return state;
            const newFuture = future.slice(1);

            return {
                past: [ ...past, present ],
                present: next,
                future: newFuture
            }
        }
        else
        {
            const newPresent = reducer(present, action);

            if (present === newPresent) return state;

            let newPast = past;

            if (action.payload?.undo && !action.payload?.undo.doNotRecord)
            {
                if (!action.payload?.undo.actionToken ||
                    action.payload?.undo.actionToken !== lastStackToken)
                {
                    newPast = [ ...past, present ].slice(-MAX_LENGTH);
                }
            }

            return {
                past: newPast,
                present: newPresent,
                future: [],
                lastStackToken: action.payload?.undo?.actionToken,
            }
        }
    }
}