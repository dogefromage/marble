import { AnyAction } from "@reduxjs/toolkit";
import { useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
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
        // targetPanelId?: string,
    ) =>
    {
        const baseArgs: CommandBaseArgs = 
        {
            callType,
        };

        let action: AnyAction | void;

        if (command.scope === CommandScope.Global)
        {
            const globalArgs: GlobalCommandArgs = { ...baseArgs };
            action = command.actionCreator(globalArgs, paramMap);
        }
        else
        {
            if (!editorStateRef.current.panelManager.activePanel) return;
            const activePanel = editorStateRef.current.panelManager.activePanel;

            const panelState = editorStateRef.current.panels[command.viewType]?.[activePanel.panelId];
            if (!panelState) console.error(`No panelstate found for active panel`);
    
            const viewArgs: ViewCommandArgs = 
            {
                ...baseArgs,
                activePanel,
                panelState,
            };
            
            // @ts-ignore because ts-stupid
            action = command.actionCreator(viewArgs, paramMap);
        }

        if (action != null)
        {
            dispatch(action);
        }

    }, [ dispatch, editorStateRef ]);
}
