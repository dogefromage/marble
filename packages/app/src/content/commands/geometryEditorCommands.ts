import { geometriesAddNode, geometriesCreate, geometriesRemoveNodes, geometriesResetUserSelectedNodes } from "../../slices/geometriesSlice";
import { geometryEditorPanelsOpenTemplateCatalog } from "../../slices/panelGeometryEditorSlice";
import { Command, CommandParameterMap, getTemplateId, Point, Rect, UndoRecord, ViewTypes } from "../../types";
import { generateCodeSafeUUID } from "../../utils/codeStrings";
import { pointScreenToWorld } from "../../utils/geometries/planarCameraMath";
import { p2v, v2p } from "../../utils/linalg";
import { TEST_USER_ID } from "../../utils/testSetup";

function getOffsetPos(panelClientRect: Rect, params: CommandParameterMap) {
    let offsetPos: Point, center = false;
    if (params.offsetPos == null) {
        offsetPos = {
            x: 0.5 * panelClientRect.w,
            y: 50,
        };
        center = true;
    } else {
        offsetPos = params.offsetPos;
    }
    return { offsetPos, center };
}

export const geometryEditorCommands: Command[] = [
    {
        scope: 'view',
        viewType: ViewTypes.GeometryEditor,
        id: 'geometryEditor.openTemplateCatalog',
        name: 'Add Node',
        actionCreator({ activePanelId, panelClientRect }, params) {
            const { offsetPos, center } = getOffsetPos(panelClientRect, params);
            return geometryEditorPanelsOpenTemplateCatalog({
                panelId: activePanelId,
                offsetPos,
                center,
            });
        },
        keyCombinations: [ { key: ' ', displayName: 'Space' } ],
    },
    {
        scope: 'view',
        viewType: ViewTypes.GeometryEditor,
        id: 'geometryEditor.deleteSelected',
        name: 'Delete Selected',
        actionCreator({ panelState: { geometryStack } }, params) {
            const geometryId = geometryStack[ 0 ];
            if (geometryId == null) return;
            return geometriesRemoveNodes({
                geometryId,
                userId: TEST_USER_ID,
                undo: { desc: `Removed all selected nodes in active geometry.` },
            });
        },
        keyCombinations: [ { key: 'Delete', displayName: 'Del' }, { key: 'x', ctrlKey: true } ],
    },
    {
        scope: 'view',
        viewType: ViewTypes.GeometryEditor,
        id: 'geometryEditor.resetSelected',
        name: 'Reset Selected',
        actionCreator({ panelState: { geometryStack } }, params) {
            const geometryId = geometryStack[ 0 ];
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
        actionCreator({ panelClientRect: activePanel, panelState: { geometryStack, camera } }, params) {
            const parentGeometryId = geometryStack[ 0 ];
            if (parentGeometryId == null) return;

            const subGeometryId = generateCodeSafeUUID();
            const subTemplateId = getTemplateId('composite', subGeometryId);
            const { offsetPos } = getOffsetPos(activePanel, params);
            const worldPos = v2p(pointScreenToWorld(camera, p2v(offsetPos)));
            
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
                        inputs: [
                            {
                                id: 'position',
                                name: 'Position',
                                type: 'input',
                                dataType: 'vec3',
                                defaultArgumentToken: 'position',
                                value: [ 0, 0, 0 ],
                            },
                            {
                                id: 'asdasd',
                                name: 'Test',
                                type: 'field',
                                dataType: 'float',
                                value: 0,
                            }
                        ],
                        outputs: [
                            {
                                id: 'basic_output',
                                type: 'output',
                                name: 'Output',
                                dataType: 'Surface',
                            }
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