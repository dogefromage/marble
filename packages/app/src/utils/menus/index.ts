import { useEffect } from "react";
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
    useEffect(() => {
        const menuState = createMenuState(menuId, menuType);
        dispatch(menusAdd({ menuId, menuState }));
        return () => {
            dispatch(menusRemove({ menuId }))
        };
    }, [menuId]);

    return useAppSelector(selectSingleMenu(menuId))
}