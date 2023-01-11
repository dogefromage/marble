import { $CombinedState, AnyAction } from "@reduxjs/toolkit";
import { useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { RootState } from "../redux/store";
import { Command, CommandBaseArgs, CommandCallTypes, CommandParameterMap, CommandScope, GlobalCommandArgs, ViewCommandArgs } from "../types";

export default function useDispatchCommand()
{
    const dispatch = useAppDispatch();

    const editorStateNotRef = useAppSelector(useCallback(state => state.editor, []));
    const editorStateRef = useRef(editorStateNotRef);
    editorStateRef.current = editorStateNotRef;

    return useCallback(( 
        command: Command,
        paramMap: CommandParameterMap,
        callType: CommandCallTypes, 
    ) => {
        const baseArgs: CommandBaseArgs = 
        {
            callType,
        };

        let actionOrActions: AnyAction[] | AnyAction | void;

        if (command.scope === CommandScope.Global)
        {
            const globalArgs: GlobalCommandArgs = { ...baseArgs };
            actionOrActions = command.actionCreator(globalArgs, paramMap);
        }
        else
        {
            if (!editorStateRef.current.panelManager.activePanel) return;
            const activePanel = editorStateRef.current.panelManager.activePanel;

            type ReducerState = RootState['editor']['panels'];
            const panelState = editorStateRef.current.panels[command.viewType as keyof ReducerState]?.[activePanel.panelId];
    
            const viewArgs: ViewCommandArgs = 
            {
                ...baseArgs,
                activePanel,
                panelState: panelState || {},
            };
            
            // @ts-ignore because ts-stupid
            actionOrActions = command.actionCreator(viewArgs, paramMap);
        }

        let actions: AnyAction[] = [];
    
        if (Array.isArray(actionOrActions)) {
            actions = actionOrActions;
        } else if (actionOrActions != null) {
            actions.push(actionOrActions)
        }
        
        for (const action of actions) {
            dispatch(action);
        }

    }, [ dispatch, editorStateRef ]);
}
