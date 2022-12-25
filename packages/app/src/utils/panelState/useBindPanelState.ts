import { useEffect } from "react";
import { panelStateBind, panelStateRemove } from "../../enhancers/panelStateEnhancer";
import { useAppDispatch } from "../../redux/hooks";
import { CreatePanelStateCallback, ViewTypes } from "../../types";

export function useBindPanelState(panelId: string, createPanelState: CreatePanelStateCallback, viewType: ViewTypes)
{
    const dispatch = useAppDispatch();

    useEffect(() =>
    {
        const panelState = createPanelState(panelId);
        dispatch(panelStateBind({ panelId, panelState, viewType }));

        return () => { 
            dispatch(panelStateRemove({ panelId })) 
        };
    }, [ panelId ]);
}