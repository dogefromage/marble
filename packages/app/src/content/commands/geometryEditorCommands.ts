import { geometriesAddNode, geometriesCreate, geometriesRemoveNode, geometriesResetStateSelected } from "../../slices/geometriesSlice";
import { geometryEditorPanelsOpenTemplateCatalog } from "../../slices/panelGeometryEditorSlice";
import { Command, CommandParameterMap, getTemplateId, Point, Rect, ViewTypes } from "../../types";
import { generateCodeSafeUUID } from "../../utils/codeStrings";
import { pointScreenToWorld } from "../../utils/geometries/planarCameraMath";
import { p2v, v2p } from "../../utils/linalg";

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
            if (!geometryStack.length) return;
            return geometriesRemoveNode({
                geometryId: geometryStack[ 0 ],
                undo: {},
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
            if (!geometryStack.length) return;
            return geometriesResetStateSelected({
                geometryId: geometryStack[ 0 ],
                undo: {},
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
            if (!geometryStack.length) return;

            const subGeometryId = generateCodeSafeUUID();;
            const actionToken = 'createsub:' + subGeometryId;
            const subTemplateId = getTemplateId(subGeometryId, 'composite');

            const { offsetPos } = getOffsetPos(activePanel, params);
            const worldPos = v2p(pointScreenToWorld(camera, p2v(offsetPos)));

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
                                dataType: 'Solid',
                            }
                        ],
                    },
                    undo: { actionToken }
                }),
                geometriesAddNode({
                    geometryId: geometryStack[ 0 ],
                    templateId: subTemplateId,
                    position: worldPos,
                    undo: { actionToken },
                })
            ];
        },
    }
]