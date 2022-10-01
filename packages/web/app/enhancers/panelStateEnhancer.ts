import { AnyAction, PayloadAction, Reducer } from "@reduxjs/toolkit";
import produce from "immer";
import { PanelState, PanelStateEnhancerSliceState } from "../types/panelState";
import { ViewTypes } from "../types/viewTypes";

enum PanelStateActionTypes
{
    Bind = 'panelState.create',
    Remove = 'panelState.remove',
}

type BindPayload = { panelId: string, panelState: PanelState, viewType: ViewTypes };
type RemovePayload = { panelId: string };

type PanelStateAction = 
    | PayloadAction<BindPayload, PanelStateActionTypes.Bind> 
    | PayloadAction<RemovePayload, PanelStateActionTypes.Remove>

export const panelStateBind = (payload: BindPayload) => ({
    type: PanelStateActionTypes.Bind,
    payload,
});

export const panelStateRemove = (payload: RemovePayload) => ({
    type: PanelStateActionTypes.Remove,
    payload,
});

export default function panelStateEnhancer<A extends AnyAction>
    (reducer: Reducer<PanelStateEnhancerSliceState, A>, viewType: ViewTypes): 
        Reducer<PanelStateEnhancerSliceState, A>
{
    return (state = {}, action) =>
    {
        const a = action as unknown as PanelStateAction;

        if (a.type === PanelStateActionTypes.Bind)
        {
            if (a.payload.viewType === viewType)
            {
                return produce(state, s =>
                {
                    s[a.payload.panelId] = a.payload.panelState;
                })
            }
        }

        if (a.type === PanelStateActionTypes.Remove)
        {
            return produce(state, s => 
            {
                delete s[a.payload.panelId];
            })
        }

        return reducer(state, action);
    }
}