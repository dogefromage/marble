import { useCallback, useEffect } from "react";
import useTrigger from "../../hooks/useTrigger";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { menusAdd, menusRemove, menusSetAvailableSpace, selectSingleMenu } from "../../slices/menusSlice";
import { MenuState, MenuTypes, Rect } from "../../types";

function createMenuState(id: string, type: MenuTypes, availableSpace: Rect): MenuState {
    return {
        id,
        type,
        isClosed: false,
        nodeStack: [],
        state: new Map(),
        availableSpace,
    }
}

export function useBindMenuState(menuId: string, menuType: MenuTypes, availableSpace: Rect) {
    const dispatch = useAppDispatch();
    const [ resetTrigger, triggerReset ] = useTrigger();

    useEffect(() => {
        const menuState = createMenuState(menuId, menuType, availableSpace);
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