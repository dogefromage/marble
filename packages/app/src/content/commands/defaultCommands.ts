import { redo, undo } from "../../enhancers/undoableEnhancer";
import { consoleClearMessages } from "../../slices/consoleSlice";
import { Command, CommandScope, ViewTypes } from "../../types";
import { geometryEditorCommands } from "./geometryEditorCommands";

export const DEFAULT_COMMANDS: Command[] =
[
    /**
     * GLOBAL
     */
    {
        id: 'global.undo',
        name: 'Undo',
        scope: CommandScope.Global,
        actionCreator: undo,
        keyCombinations: [ { key: 'z', ctrlKey: true } ],
    },
    {
        id: 'global.redo',
        name: 'Redo',
        scope: CommandScope.Global,
        actionCreator: redo,
        keyCombinations: [ { key: 'y', ctrlKey: true } ],
    },
    /**
     * Console view
     */
    {
        scope: CommandScope.View,
        viewType: ViewTypes.Console,
        id: 'console.clearMessages',
        name: 'Clear Messages',
        actionCreator()
        {
            return consoleClearMessages({
                undo: {}
            });
        },
    },
    ...geometryEditorCommands,
]