import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "../redux/store";
import { decomposeTemplateId, GeometriesSliceState, GeometryConnectionData, GeometryIncomingElement, GeometryJointLocation, GeometryS, GeometryTemplate, GNodeState, NodeTemplateId, Point, RowS, BaseRowS, UndoAction } from "../types";
import { generateAlphabeticalId } from "../utils/generateIds";

const defaultGeometryContent = {
    name: 'New Geometry',
    nodes: [],
    version: 0,
    rowStateInvalidator: 0,
    nextIdIndex: 0,
    selectedNodes: [],
};

function getGeometry(s: GeometriesSliceState, a: { payload: { geometryId: string } }) {
    const g = s[ a.payload.geometryId ];
    if (!g) return console.error(`Geometry with id ${a.payload.geometryId} not found`);
    return g;
}

function getNode(s: GeometriesSliceState, a: { payload: { geometryId: string, nodeId: string } }) {
    const n = getGeometry(s, a)?.nodes.find(n => n.id === a.payload.nodeId);
    if (!n) return console.error(`Node with id ${a.payload.nodeId} not found`);
    return n;
}

function removeIncomingElements(s: GeometriesSliceState, geometryId: string, elements: GeometryJointLocation[]) {
    for (const element of elements) {
        const node = getNode(s, {
            payload: { geometryId, nodeId: element.nodeId }
        });
        const outputs = node?.rows?.[ element.rowId ]?.incomingElements;
        if (outputs) {
            outputs.splice(element.subIndex, 1); // Remove desired entry
        } else {
            console.error(`Output not found`);
        }
    }
}

const initialState: GeometriesSliceState = {};

export const geometriesSlice = createSlice({
    name: 'geometries',
    initialState,
    reducers: {
        create: (s, a: UndoAction<{
            geometryId?: string,
            geometryTemplate: GeometryTemplate,
        }>) => {
            const id = a.payload.geometryId || uuidv4();
            if (s[ id ] != null) {
                throw new Error(`Geometry with id ${id} already exists!`);
            }

            s[ id ] = {
                ...defaultGeometryContent,
                ...a.payload.geometryTemplate,
                id,
            }
        },
        remove: (s, a: UndoAction<{ geometryId: string }>) => {
            delete s[ a.payload.geometryId ];
        },
        addNode: (s, a: UndoAction<{ geometryId: string, templateId: NodeTemplateId, position: Point }>) => {
            const g = getGeometry(s, a);
            if (!g) return;

            const node: GNodeState = {
                id: generateAlphabeticalId(g.nextIdIndex++),
                templateId: a.payload.templateId,
                templateVersion: -1,
                position: a.payload.position,
                rows: {},
            }
            g.nodes.push(node);
            g.version++;
        },
        removeNode: (s, a: UndoAction<{ geometryId: string, nodeId?: string }>) => {
            const g = getGeometry(s, a);
            if (!g) return;

            const targets = a.payload.nodeId != null ?
                [ a.payload.nodeId ] : g.selectedNodes;

            g.nodes = g.nodes.filter(n => !targets.includes(n.id));
            g.version++;
        },
        positionNode: (s, a: UndoAction<{ geometryId: string, nodeId: string, position: Point }>) => {
            const n = getNode(s, a);
            if (!n) return;

            n.position = { ...a.payload.position };
        },
        moveNodes: (s, a: UndoAction<{ geometryId: string, delta: Point }>) => {
            const g = getGeometry(s, a);
            if (!g) return;

            const selectedNodes = g.nodes.filter(node => g.selectedNodes.includes(node.id));
            for (const selected of selectedNodes) {
                selected.position.x += a.payload.delta.x;
                selected.position.y += a.payload.delta.y;
            }
        },
        assignRowData: (s, a: UndoAction<{ geometryId: string, nodeId: string, rowId: string, rowData?: Partial<RowS> }>) => {
            const n = getNode(s, a);
            if (!n) return;

            if (a.payload.rowData) {
                const superDefault: BaseRowS = {
                    incomingElements: [],
                }
                // @ts-ignore
                n.rows[ a.payload.rowId ] = {
                    ...superDefault,
                    ...n.rows[ a.payload.rowId ],
                    ...a.payload.rowData,
                }
            }
            else {
                delete n.rows[ a.payload.rowId ];
            }

            const g = getGeometry(s, a)!;
            g.rowStateInvalidator++;
        },
        insertIncomingElement: (s, a: UndoAction<{
            geometryId: string,
            jointLocation: GeometryJointLocation,
            incomingElement: GeometryIncomingElement
            isStackedInput?: boolean,
        }>) => {
            const g = getGeometry(s, a);
            if (!g) return;

            const inputNode = getNode(s, {
                payload: {
                    nodeId: a.payload.jointLocation.nodeId,
                    geometryId: a.payload.geometryId,
                }
            });
            if (!inputNode) return;

            const defaultInputRow: RowS = { incomingElements: [] };
            const inputRow = inputNode.rows[ a.payload.jointLocation.rowId ] || defaultInputRow;
            inputNode.rows[ a.payload.jointLocation.rowId ] = inputRow;

            if (a.payload.isStackedInput) {
                const newSubIndex = a.payload.jointLocation.subIndex;
                inputRow.incomingElements = [
                    ...inputRow.incomingElements.slice(0, newSubIndex),
                    a.payload.incomingElement,
                    ...inputRow.incomingElements.slice(newSubIndex),
                ];
            } else {
                inputRow.incomingElements = [ a.payload.incomingElement ];
            }

            g.version++;
        },
        removeIncomingElements: (s, a: UndoAction<{ geometryId: string, joints: GeometryJointLocation[] }>) => {
            const g = getGeometry(s, a);
            if (!g) return;
            removeIncomingElements(s, a.payload.geometryId, a.payload.joints);
            g.version++;
        },
        setSelectedNodes: (s, a: UndoAction<{ geometryId: string, selection: string[] }>) => {
            const g = getGeometry(s, a);
            if (!g) return;
            g.selectedNodes = a.payload.selection;
        },
        resetStateSelected: (s, a: UndoAction<{ geometryId: string }>) => {
            const g = getGeometry(s, a);
            if (!g) return;

            const defaultRowState: { [ K in keyof RowS ]: true } = {
                'incomingElements': true,
            }

            for (const node of g.nodes) {
                if (!g.selectedNodes.includes(node.id)) continue;
                // for every row of every selected node
                for (const row of Object.values(node.rows)) {
                    // every key of that row
                    for (const key in row) {
                        if (!Object.hasOwn(defaultRowState, key)) {
                            delete row[ key as keyof RowS ]; // remove if not in default state i.e. not connectedOutputs, etc
                        }
                    }
                }
            }
            g.rowStateInvalidator++;
        },
        updateExpiredProps: (s, a: PayloadAction<{
            geometries: { geometryId: string, geometryVersion: number, expiredProps: GeometryConnectionData[ 'expiredProps' ] }[];
        }>) => {

            for (const { geometryId, geometryVersion, expiredProps } of a.payload.geometries) {
                const g = getGeometry(s, { payload: { geometryId } });
                if (!g) return;

                if (geometryVersion < g.version) {
                    continue; // the task is outdated / duplicate
                }

                // remove all stray joints
                removeIncomingElements(s, geometryId, expiredProps.strayJoints);

                const superDefaultRow: BaseRowS = { incomingElements: [] };

                // update templates
                for (const { nodeIndex, template } of expiredProps.expiredNodeStates) {
                    const node = g.nodes[ nodeIndex ];
                    if (node.templateId !== template.id) {
                        throw new Error(`wrong template passed`);
                    }
                    // find unnecessary row state
                    for (const rowId in node.rows) {
                        if (template.rows.find(row => row.id === rowId) == null) {
                            delete node.rows[ rowId ]; // this rowstate is outdated
                        }
                    }
                    // add missing row state
                    for (let rowIndex = 0; rowIndex < template.rows.length; rowIndex++) {
                        const rowId = template.rows[ rowIndex ].id;
                        if (node.rows[ rowId ] == null) {
                            node.rows[ rowId ] = superDefaultRow;
                        }
                    }
                    
                    node.templateVersion = template.version;
                }
                g.version++;
            }
        }
    }
});

export const {
    create: geometriesCreate,
    remove: geometriesRemove,
    addNode: geometriesAddNode,
    removeNode: geometriesRemoveNode,
    positionNode: geometriesPositionNode,
    moveNodes: geometriesMoveNodes,
    assignRowData: geometriesAssignRowData,
    insertIncomingElement: geometriesInsertIncomingElement,
    removeIncomingElements: geometriesRemoveIncomingElements,
    setSelectedNodes: geometriesSetSelectedNodes,
    resetStateSelected: geometriesResetStateSelected,
    updateExpiredProps: geometriesUpdateExpiredProps,
} = geometriesSlice.actions;

export const selectGeometries = (state: RootState) => state.project.present.geometries;

export const selectSingleGeometry = (geometryId: string | undefined) =>
    useCallback((state: RootState) => // memoize selector bc. redux will
        selectGeometries(state)[geometryId!] as GeometryS | undefined,
        [ geometryId ]
    );

const geometriesReducer = geometriesSlice.reducer;

export default geometriesReducer;
