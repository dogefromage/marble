import { redo, undo } from "../enhancers/undoableEnhancer";
import { geometriesRemoveNode } from "../slices/geometriesSlice";
import { geometryEditorPanelOpenTemplateCatalog } from "../slices/panelGeometryEditorSlice";
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
        actionCreator({ callType, activePanel }, params)
        {
            let offsetPos: Point, center = false;

            switch (callType)
            {
                case CommandCallTypes.ContextMenu:
                {
                    offsetPos = params.offsetPos;
                    break;
                }
                case CommandCallTypes.KeyCombination:
                {
                    const bounds = activePanel.panelClientRect;
                    
                    offsetPos = {
                        x: 0.5 * bounds.w,
                        y: 0.5 * bounds.h,
                    };
                    center = true;
                    break;
                }
                default:
                {
                    return console.error(`Calltype not found`)
                }
            }

            return geometryEditorPanelOpenTemplateCatalog({
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
        id: 'geometryEditor.deleteNode',
        name: 'Delete Node',
        actionCreator: (({ panelState: { geometryId, activeNode }}, params) => 
        {
            // preference list of which node will be selected
            const targetNode = params.nodeId || activeNode;
            if (typeof targetNode !== 'string') return;
            if (!geometryId) return;

            return geometriesRemoveNode({
                geometryId, 
                nodeId: targetNode,
                undo: {},
            });
        }),
        keyCombinations: [ { key: 'Delete', displayName: 'Del' }, { key: 'x', ctrlKey: true } ],
    }
]