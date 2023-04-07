import { redo, undo } from "../../enhancers/undoableEnhancer";
import { consoleClearMessages } from "../../slices/consoleSlice";
import { Command, ViewTypes } from "../../types";
import { flowEditorCommands } from "./flowEditorCommands";
import { viewportCommands } from "./viewportCommands";

export const DEFAULT_COMMANDS: Command[] =
[
    /**
     * GLOBAL
     */
    {
        id: 'global.undo',
        name: 'Undo',
        scope: 'global',
        actionCreator: undo,
        keyCombinations: [ { key: 'z', ctrlKey: true } ],
    },
    {
        id: 'global.redo',
        name: 'Redo',
        scope: 'global',
        actionCreator: redo,
        keyCombinations: [ { key: 'y', ctrlKey: true } ],
    },
    /**
     * Console view
     */
    {
        scope: 'view',
        viewType: ViewTypes.Console,
        id: 'console.clearMessages',
        name: 'Clear Messages',
        actionCreator() {
            return consoleClearMessages({
                undo: { desc: `Cleared all messages from the console.` }
            });
        },
    },
    ...flowEditorCommands,
    ...viewportCommands
]