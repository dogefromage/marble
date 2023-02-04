import { useCallback, useEffect } from "react";
import useTrigger from "../../hooks/useTrigger";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { menusAdd, menusRemove, selectSingleMenu } from "../../slices/menusSlice";
import { MenuState, MenuTypes } from "../../types";

function createMenuState(id: string, type: MenuTypes): MenuState {
    return {
        id,
        type,
        isClosed: false,
        nodeStack: [],
        state: new Map(),
    }
}

export function useBindMenuState(menuId: string, menuType: MenuTypes) {
    const dispatch = useAppDispatch();
    const [ resetTrigger, triggerReset ] = useTrigger();

    useEffect(() => {
        const menuState = createMenuState(menuId, menuType);
        dispatch(menusAdd({ menuId, menuState }));
        return () => {
            dispatch(menusRemove({ menuId }))
        };
    }, [ menuId, resetTrigger ]);

    return {
        menuState: useAppSelector(selectSingleMenu(menuId)),
        resetMenuState: triggerReset,
    }
}