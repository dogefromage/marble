import { v4 as uuidv4 } from "uuid";
import { geometriesAddNode, geometriesCreate, geometriesRemoveNode, geometriesResetStateSelected } from "../../slices/geometriesSlice";
import { geometryEditorPanelsOpenTemplateCatalog } from "../../slices/panelGeometryEditorSlice";
import { ActivePanel, Command, CommandParameterMap, CommandScope, DataTypes, Point, ViewTypes } from "../../types";
import { pointScreenToWorld } from "../../utils/geometries/planarCameraMath";
import { p2v, v2p } from "../../utils/linalg";

function getOffsetPos(activePanel: ActivePanel, params: CommandParameterMap) {
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
    return { offsetPos, center };
}

export const geometryEditorCommands: Command[] =
[
    {
        scope: CommandScope.View,
        viewType: ViewTypes.GeometryEditor,
        id: 'geometryEditor.openTemplateCatalog',
        name: 'Add Node',
        actionCreator({ activePanel }, params) {
            const { offsetPos, center } = getOffsetPos(activePanel, params);

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
        actionCreator({ panelState: { geometryStack }}, params) {
            if (!geometryStack.length) return;
            return geometriesRemoveNode({
                geometryId: geometryStack[0],
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
        actionCreator({ panelState: { geometryStack }}, params)
        {
            if (!geometryStack.length) return;
            return geometriesResetStateSelected({
                geometryId: geometryStack[0],
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
        actionCreator({ activePanel, panelState: { geometryStack, camera }}, params) {
            if (!geometryStack.length) return;

            const actionToken = 'create-sub-' + uuidv4();
            const subId = uuidv4();

            const { offsetPos } = getOffsetPos(activePanel, params);
            const worldPos = v2p(pointScreenToWorld(camera, p2v(offsetPos)));

            return [
                geometriesCreate({
                    geometryId: subId,
                    geometryTemplate: {
                        isRoot: false,
                        name: 'Sub geometry',
                        arguments: [],
                        returnType: DataTypes.Float,
                    },
                    undo: { actionToken }
                }),
                geometriesAddNode({
                    geometryId: geometryStack[0],
                    templateId: subId,
                    position: worldPos,
                    undo: { actionToken },
                })
            ];
        },
    }
]