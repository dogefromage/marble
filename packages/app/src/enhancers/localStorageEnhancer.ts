import { AnyAction, Reducer } from "@reduxjs/toolkit";

// https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
function replacer(key: string, value: any) {
    if (value instanceof Map) {
        return {
            __type__: 'Map',
            data: Array.from(value.entries()),
        };
    }
    if (value instanceof Set) {
        return {
            __type__: 'Set',
            data: Array.from(value.values()),
        };
    }
    return value;
}
function reviver(key: string, value: any) {
    if (typeof value === 'object' && value !== null) {
        if (value.__type__ === 'Map') {
            return new Map(value.data);
        }
        if (value.__type__ === 'Set') {
            return new Set(value.data);
        }
    }
    return value;
}

export default function localStorageEnhancer<S extends any, A extends AnyAction>
    (reducer: Reducer<S, A>, storageKey: string): Reducer<S, A> {
    return (state, action) => {
        if (!state && typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey);
            if (stored != null) {
                state = JSON.parse(stored, reviver);
            }
        }

        const newState = reducer(state, action);

        if (state !== newState) {
            if (typeof window !== 'undefined') {
                const stateJSON = JSON.stringify(newState, replacer);
                localStorage.setItem(storageKey, stateJSON);
            }
        }

        return newState;
    }
}