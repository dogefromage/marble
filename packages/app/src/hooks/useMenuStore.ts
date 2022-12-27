import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useMemo, useReducer } from "react";
import { MenuStackElement, MenuState, MenuStore, MenuTypes } from "../types";

export const menuSlice = createSlice({
    name: 'menu',
    initialState: {} as MenuState,
    reducers: {
        setElement: (s, a: PayloadAction<{ depth: number, element: MenuStackElement }>) => {
            const before = s.stack.slice(0, a.payload.depth);
            const newEl = a.payload.element;
            s.stack = [ ...before, newEl ];
            s.closed = false;
        },
        close: s => {
            s.stack = [];
            s.closed = true;
        },
        setSearchValue: (s, a: PayloadAction<{ value: string }>) => {
            s.searchValue = a.payload.value;
        }
    }
});

export const {
    setElement: menuStoreSetElement,
    close: menuStoreClose,
    setSearchValue: menuStoreSetSearchValue,
} = menuSlice.actions;

export default function useMenuStore(type: MenuTypes): MenuStore 
{
    const [ state, dispatch ] = useReducer(menuSlice.reducer, {
        type,
        stack: [], 
        closed: false,
        searchValue: '',
    });

    return useMemo(() => ({
        state, 
        dispatch,
    }), [ state, dispatch ]);
}