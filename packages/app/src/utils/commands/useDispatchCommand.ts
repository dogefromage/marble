import { $CombinedState, AnyAction } from "@reduxjs/toolkit";
import { useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { Command, CommandBaseArgs, CommandCallTypes, CommandParameterMap, GlobalCommandArgs, ViewCommandArgs } from "../../types";

export default function useDispatchCommand() {
    const dispatch = useAppDispatch();

    const editorStateNotRef = useAppSelector(useCallback(state => state.editor, []));
    const editorStateRef = useRef(editorStateNotRef);
    editorStateRef.current = editorStateNotRef;

    return useCallback((
        command: Command,
        paramMap: CommandParameterMap,
        callType: CommandCallTypes,
    ) => {
        const baseArgs: CommandBaseArgs = {
            callType,
        };
        let actionOrActions: AnyAction[] | AnyAction | void;

        if (command.scope === 'global') {
            const globalArgs: GlobalCommandArgs = { ...baseArgs };
            actionOrActions = command.actionCreator(globalArgs, paramMap);
        }
        else {
            const panelManager = editorStateRef.current.panelManager;
            const activePanelId = panelManager.activePanelId;
            const panelClientRect = panelManager.clientRects.get(activePanelId);
            if (!panelClientRect) return;

            type ReducerState = RootState['editor']['panels'];
            const panelState = editorStateRef.current.panels[command.viewType as keyof ReducerState]?.[activePanelId];

            const viewArgs: ViewCommandArgs = {
                ...baseArgs,
                activePanelId,
                panelClientRect,
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

    }, [dispatch, editorStateRef]);
}
