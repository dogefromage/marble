import { redo, undo } from "../enhancers/undoableEnhancer";
import { Command, CommandScope } from "../types";

export const DEFAULT_COMMANDS: Command[] =
[
    {
        id: 'global.undo',
        name: 'Undo',
        scope: CommandScope.Global,
        actionCreator: undo,
        keyCombination: { lowerCaseKey: 'z', ctrlKey: true },
    },
    {
        id: 'global.redo',
        name: 'Redo',
        scope: CommandScope.Global,
        actionCreator: redo,
        keyCombination: { lowerCaseKey: 'y', ctrlKey: true },
    },
]