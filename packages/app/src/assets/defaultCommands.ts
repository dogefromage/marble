import { redo, undo } from "../enhancers/undoableEnhancer";
import { consoleClearMessages } from "../slices/consoleSlice";
import { geometriesRemoveNode, geometriesResetStateSelected } from "../slices/geometriesSlice";
import { geometryEditorPanelsOpenTemplateCatalog } from "../slices/panelGeometryEditorSlice";
import { Command, CommandCallTypes, CommandScope, Point, ViewTypes } from "../types";

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
     * GEOMETRY EDITOR
     */
    {
        scope: CommandScope.View,
        viewType: ViewTypes.GeometryEditor,
        id: 'geometryEditor.openTemplateCatalog',
        name: 'Add Node',
        actionCreator({ activePanel }, params)
        {
            let offsetPos: Point, center = false;

            if (params.offsetPos == null) {
                const bounds = activePanel.panelClientRect;
                offsetPos = {
                    x: 0.5 * bounds.w,
                    y: 50,
                };
                center = true;
            } else {
                offsetPos = params.offsetPos;
            }

            return geometryEditorPanelsOpenTemplateCatalog({
                panelId: activePanel.panelId,
                offsetPos,
                center,
            });
        },
        keyCombinations: [ { key: ' ', displayName: 'Space' }],
    },
    {
        scope: CommandScope.View,
        viewType: ViewTypes.GeometryEditor,
        id: 'geometryEditor.deleteSelected',
        name: 'Delete Selected',
        actionCreator({ panelState: { geometryId }}, params)
        {
            if (!geometryId) return;
            return geometriesRemoveNode({
                geometryId,
                undo: {},
            });
        },
        keyCombinations: [ { key: 'Delete', displayName: 'Del' }, { key: 'x', ctrlKey: true } ],
    },
    {
        scope: CommandScope.View,
        viewType: ViewTypes.GeometryEditor,
        id: 'geometryEditor.resetSelected',
        name: 'Reset Selected',
        actionCreator({ panelState: { geometryId }}, params)
        {
            if (!geometryId) return;
            return geometriesResetStateSelected({
                geometryId,
                undo: {},
            });
        },
        // keyCombinations: [ { key: 'Delete', displayName: 'Del' }, { key: 'x', ctrlKey: true } ],
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
]