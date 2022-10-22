import { useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { Command, CommandBaseArgs, CommandScope } from "../types";

export default function useDispatchCommand()
{
    const dispatch = useAppDispatch();

    const editorState = useAppSelector(state => state.editor);
    const editorStateRef = useRef(editorState);
    editorStateRef.current = editorState;

    return useCallback((command: Command) =>
    {
        const baseArgs: CommandBaseArgs = {};

        if (command.scope === CommandScope.Global)
        {
            const action = command.actionCreator(baseArgs);
            dispatch(action);
        }
        else
        {
            const activePanelId = editorStateRef.current.panelManager.activePanel;
            
            const panelState = editorState.panels[command.viewType][activePanelId!];
            if (!panelState)
            {
                console.error(`Active panel not candidate for available command`);
                return;
            }
    
            const action = command.actionCreator({
                ...baseArgs,
                panelState,
            });
    
            dispatch(action);
        }
    }, [ dispatch, editorStateRef ]);
}