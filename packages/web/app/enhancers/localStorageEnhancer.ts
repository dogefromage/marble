import { AnyAction, Reducer } from "@reduxjs/toolkit";

export default function localStorageEnhancer<S extends any, A extends AnyAction>
    (reducer: Reducer<S, A>, storageKey: string): Reducer<S, A>
{
    return (state, action) =>
    {
        if (!state && typeof window !== 'undefined')
        {
            const stored = localStorage.getItem(storageKey);

            if (stored)
                state = JSON.parse(stored);
        }

        const newState = reducer(state, action);

        if (state !== newState)
        {
            if (typeof window !== 'undefined')
            {
                const stateJSON = JSON.stringify(newState);
                localStorage.setItem(storageKey, stateJSON);
            }
        }

        return newState;
    }
}