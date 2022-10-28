import { redo, undo } from "../enhancers/undoableEnhancer";
import { geometriesRemoveNode } from "../slices/geometriesSlice";
import { Command, CommandScope, ViewTypes } from "../types";
import temporaryPushError from "../utils/temporaryPushError";

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
        keyCombination: { lowerCaseKey: 'z', ctrlKey: true },
    },
    {
        id: 'global.redo',
        name: 'Redo',
        scope: CommandScope.Global,
        actionCreator: redo,
        keyCombination: { lowerCaseKey: 'y', ctrlKey: true },
    },
    /**
     * GEOMETRY EDITOR
     */
    {
        id: 'geometryEditor.deleteActive',
        name: 'Delete Active Node',
        scope: CommandScope.View,
        viewType: ViewTypes.GeometryEditor,
        actionCreator: (({ panelState: { geometryId, activeNode }}, params) => 
        {
            // preference list of which node will be selected
            const targetNode = params.nodeId || activeNode;
            if (typeof targetNode !== 'string') return console.error(`Wrong type`);
            
            if (!geometryId) return temporaryPushError('No geometry');
            if (!targetNode) return temporaryPushError('No active node');

            return geometriesRemoveNode({
                geometryId, 
                nodeId: targetNode,
                undo: {},
            });
        })
    }
]