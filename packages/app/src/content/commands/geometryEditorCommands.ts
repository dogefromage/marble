import { v4 as uuidv4 } from "uuid";
import { geometriesAddNode, geometriesCreate, geometriesRemoveNode, geometriesResetStateSelected } from "../../slices/geometriesSlice";
import { geometryEditorPanelsOpenTemplateCatalog } from "../../slices/panelGeometryEditorSlice";
import { Command, CommandScope, DataTypes, Point, ViewTypes } from "../../types";

export const geometryEditorCommands: Command[] =
[
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
    {
        scope: CommandScope.View,
        viewType: ViewTypes.GeometryEditor,
        id: 'geometryEditor.createSubgeometry',
        name: 'Create Group',
        actionCreator({ panelState: { geometryId, camera }}, params) {
            if (!geometryId) return;

            const actionToken = 'create-sub-' + uuidv4();
            const subId = uuidv4();

            return [
                geometriesCreate({
                    geometryId: subId,
                    geometryTemplate: {
                        isRoot: false,
                        arguments: [],
                        returnType: DataTypes.Float,
                    },
                    undo: { actionToken }
                }),
                geometriesAddNode({
                    geometryId: geometryId,
                    templateId: subId,
                    position: { x: 0, y: 0 },
                    undo: { actionToken },
                })
            ];
        },
    }
]