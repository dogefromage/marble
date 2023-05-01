import { AnyAction } from "@reduxjs/toolkit";
import { useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { RootState } from "../../redux/store";
import { selectCommands } from "../../slices/commandsSlice";
import { CommandBaseArgs, CommandCallTypes, CommandParameterMap, GlobalCommandArgs, ViewCommandArgs } from "../../types";
import { clientToOffsetPos, offsetToClientPos } from "../panelManager";

const ID = <T>(t: T) => t;

export default function useDispatchCommand() {
    const dispatch = useAppDispatch();
    const { commands } = useAppSelector(selectCommands);
    const commandsRef = useRef(commands);
    commandsRef.current = commands;

    const editorStateNotRef = useAppSelector(ID);
    const stateRef = useRef(editorStateNotRef);
    stateRef.current = editorStateNotRef;

    return useCallback((
        commandId: string,
        paramMap: CommandParameterMap,
        callType: CommandCallTypes,
    ) => {
        const command = commandsRef.current[commandId];
        if (!command) {
            return console.error(`Command with id "${commandId}" not found`);
        }

        const baseArgs: CommandBaseArgs = {
            callType,
        };
        let actionOrActions: AnyAction[] | AnyAction | void;

        if (command.scope === 'global') {
            const globalArgs: GlobalCommandArgs = { ...baseArgs };
            actionOrActions = command.actionCreator(globalArgs, paramMap);
        } else {
            const panelManager = stateRef.current.panelManager;
            const activePanelId = panelManager.activePanelId;
            const panelClientRect = panelManager.clientRects.get(activePanelId);
            if (!panelClientRect) {
                return console.error(`Command panel client rect not found`);
            }

            type ReducerState = RootState['panels'];
            const panelState = stateRef.current.panels[command.viewType as keyof ReducerState]?.[activePanelId];

            // center
            const offsetCenter = {
                x: panelClientRect.w / 2.0,
                y: panelClientRect.h / 2.0,
            }
            const clientCenter = offsetToClientPos(panelClientRect, offsetCenter);
            // cursor
            const clientCursor = paramMap.clientCursor;
            const offsetCursor = clientCursor
                ? clientToOffsetPos(panelClientRect, clientCursor) 
                : undefined;

            const viewArgs: ViewCommandArgs = {
                ...baseArgs,
                activePanelId,
                panelClientRect,
                panelState: panelState || {},
                offsetCenter, clientCenter,
                offsetCursor, clientCursor,
            };
            // @ts-ignore
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

    }, [ dispatch, stateRef, commandsRef ]);
}
