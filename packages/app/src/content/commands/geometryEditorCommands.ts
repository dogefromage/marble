import { geometriesAddNode, geometriesCreate, geometriesRemoveNodes, geometriesResetUserSelectedNodes } from "../../slices/geometriesSlice";
import { geometryEditorPanelsOpenTemplateCatalog } from "../../slices/panelGeometryEditorSlice";
import { Command, getTemplateId, UndoRecord, ViewTypes } from "../../types";
import { defaultOutputRows } from "../../types/geometries/defaultRows";
import { generateCodeSafeUUID } from "../../utils/codeStrings";
import { pointScreenToWorld } from "../../utils/geometries/planarCameraMath";
import { TEST_USER_ID } from "../../utils/testSetup";

export const geometryEditorCommands: Command[] = [
    {
        scope: 'view',
        viewType: ViewTypes.GeometryEditor,
        id: 'geometryEditor.openTemplateCatalog',
        name: 'Add Node',
        actionCreator({ activePanelId, clientCursor, offsetCursor, offsetCenter, clientCenter }, params) {
            return geometryEditorPanelsOpenTemplateCatalog({
                panelId: activePanelId,
                menuAnchor: clientCursor || clientCenter,
                offsetPosition: offsetCursor || offsetCenter,
            });
        },
        keyCombinations: [{ key: ' ', displayName: 'Space' }],
    },
    {
        scope: 'view',
        viewType: ViewTypes.GeometryEditor,
        id: 'geometryEditor.deleteSelected',
        name: 'Delete Selected',
        actionCreator({ panelState: { geometryStack } }, params) {
            const geometryId = geometryStack[0];
            if (geometryId == null) return;
            return geometriesRemoveNodes({
                geometryId,
                userId: TEST_USER_ID,
                undo: { desc: `Removed all selected nodes in active geometry.` },
            });
        },
        keyCombinations: [{ key: 'Delete', displayName: 'Del' }, { key: 'x', ctrlKey: true }],
    },
    {
        scope: 'view',
        viewType: ViewTypes.GeometryEditor,
        id: 'geometryEditor.resetSelected',
        name: 'Reset Selected',
        actionCreator({ panelState: { geometryStack } }, params) {
            const geometryId = geometryStack[0];
            if (geometryId == null) return;
            return geometriesResetUserSelectedNodes({
                geometryId,
                userId: TEST_USER_ID,
                undo: { desc: `Reset values of all selected nodes in active geometry.` },
            });
        },
        // keyCombinations: [ { key: 'Delete', displayName: 'Del' }, { key: 'x', ctrlKey: true } ],
    },
    {
        scope: 'view',
        viewType: ViewTypes.GeometryEditor,
        id: 'geometryEditor.createSubgeometry',
        name: 'Create Group',
        actionCreator({ offsetCursor, offsetCenter, panelState: { geometryStack, camera } }, params) {
            const parentGeometryId = geometryStack[0];
            if (parentGeometryId == null) return;

            const subGeometryId = generateCodeSafeUUID();
            const subTemplateId = getTemplateId('composite', subGeometryId);
            const worldPos = pointScreenToWorld(camera, offsetCursor || offsetCenter);

            const undoRecord: UndoRecord = {
                actionToken: 'createsub:' + subGeometryId,
                desc: `Created new subgeometry and placed node into current.`
            }

            return [
                geometriesCreate({
                    geometryId: subGeometryId,
                    geometryTemplate: {
                        name: 'Sub Geometry',
                        isRoot: false,
                        inputs: [],
                        outputs: [
                            defaultOutputRows['surface'],
                        ],
                    },
                    undo: undoRecord,
                }),
                geometriesAddNode({
                    geometryId: parentGeometryId,
                    templateId: subTemplateId,
                    position: worldPos,
                    undo: undoRecord,
                })
            ];
        },
    }
]