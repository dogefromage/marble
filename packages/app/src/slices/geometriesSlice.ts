import { createSlice } from "@reduxjs/toolkit";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "../redux/store";
import { GeometryS, RowT, RowS, InputOnlyRowT, GNodeT, Point, GNodeS, GeometriesSliceState, UndoAction, GeometryJointLocation, GeometryIncomingElement } from "../types";
import generateAlphabeticalId from "../utils/generateAlphabeticalId";

function createGeometry(id: string)
{
    const geometry: GeometryS =
    {
        id,
        name: 'New Geometry',
        nodes: [],
        compilationValidity: 0,
        rowStateValidity: 0,
        nextIdIndex: 0,
        selectedNodes: [],
    }

    return geometry;
}

function createRowState(rowT: RowT) {
    const rowS: RowS = {
        incomingElements: [],
    };
    return rowS;
}

function createNode(template: GNodeT, nextIdIndex: number, position: Point)
{
    const rows = Object.fromEntries(
        template.rows.map(row => [
            row.id,
            createRowState(row),
        ])
    );
    
    const node: GNodeS = 
    {
        id: generateAlphabeticalId(nextIdIndex),
        templateId: template.id,
        position: { ...position },
        tags: template.tags,
        rows,
    }

    return {
        node,
        nextIdIndex: nextIdIndex + 1,
    };
}

function getGeometry(s: GeometriesSliceState, a: { payload: { geometryId: string } })
{
    const g = s[a.payload.geometryId];
    if (!g) return console.error(`Geometry with id ${a.payload.geometryId} not found`);
    return g;
}

function getNode(s: GeometriesSliceState, a: { payload: { geometryId: string, nodeId: string } })
{
    const n = getGeometry(s, a)?.nodes.find(n => n.id === a.payload.nodeId);
    if (!n) return console.error(`Node with id ${a.payload.nodeId} not found`);
    return n;
}

const initialState: GeometriesSliceState = {};

export const geometriesSlice = createSlice({
    name: 'geometries',
    initialState,
    reducers: {
        new: (s, a: UndoAction<{ geometryId?: string }>) =>
        {
            const id = a.payload.geometryId || uuidv4();
            s[id] = createGeometry(id); 
        },
        remove: (s, a: UndoAction<{ geometryId: string }>) =>
        {
            delete s[a.payload.geometryId];
        },
        addNode: (s, a: UndoAction<{ geometryId: string, template: GNodeT, position: Point }>) =>
        {
            const g = getGeometry(s, a);
            if (!g) return;

            const { node, nextIdIndex } = createNode(a.payload.template, g.nextIdIndex, a.payload.position);
            g.nodes.push(node);
            g.nextIdIndex = nextIdIndex;
            g.compilationValidity++;
        },
        removeNode: (s, a: UndoAction<{ geometryId: string, nodeId?: string }>) =>
        {
            const g = getGeometry(s, a);
            if (!g) return;

            const targets = a.payload.nodeId != null ? 
                [ a.payload.nodeId ] : g.selectedNodes;

            g.nodes = g.nodes.filter(n => !targets.includes(n.id));
            g.compilationValidity++;
        },
        positionNode: (s, a: UndoAction<{ geometryId: string, nodeId: string, position: Point }>) =>
        {
            const n = getNode(s, a);
            if (!n) return;

            n.position = { ...a.payload.position };
        },
        moveNodes: (s, a: UndoAction<{ geometryId: string, delta: Point }>) =>
        {
            const g = getGeometry(s, a);
            if (!g) return;

            const selectedNodes = g.nodes.filter(node => g.selectedNodes.includes(node.id));
            for (const selected of selectedNodes)
            {
                selected.position.x += a.payload.delta.x;
                selected.position.y += a.payload.delta.y;
            }
        },
        assignRowData: (s, a: UndoAction<{ geometryId: string, nodeId: string, rowId: string, rowData?: Partial<RowS> }>) =>
        {
            const n = getNode(s, a);
            if (!n) return;

            if (a.payload.rowData)
            {
                // @ts-ignore
                n.rows[a.payload.rowId] = {
                    ...n.rows[a.payload.rowId],
                    ...a.payload.rowData,
                }
            }
            else
            {
                delete n.rows[a.payload.rowId];
            }
        
            const g = getGeometry(s, a)!;
            g.rowStateValidity++;
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

            const inputRow = inputNode.rows[a.payload.jointLocation.rowId];

            if (a.payload.isStackedInput)
            {
                const newSubIndex = a.payload.jointLocation.subIndex;
                inputRow.incomingElements = [
                    ...inputRow.incomingElements.slice(0, newSubIndex),
                    a.payload.incomingElement,
                    ...inputRow.incomingElements.slice(newSubIndex),
                ];
            } else {
                inputRow.incomingElements = [ a.payload.incomingElement ];
            }

            g.compilationValidity++;
        },
        // connectJoints: (s, a: UndoAction<{ 
        //     geometryId: string, 
        //     inputJoint: GeometryJointLocation, 
        //     inputDataType: DataTypes,
        //     outputJoint: GeometryJointLocation,
        //     outputDataType: DataTypes,
        //     mergeStackInput: boolean,
        // }>) =>
        // {
        //     const g = getGeometry(s, a);
        //     if (!g) return;

        //     const inputNode = getNode(s, { 
        //         payload: {
        //             nodeId: a.payload.inputJoint.nodeId,
        //             geometryId: a.payload.geometryId, 
        //         }
        //     }); 
        //     if (!inputNode) return;

        //     const inputRow = inputNode.rows[a.payload.inputJoint.rowId];

        //     if (a.payload.inputDataType !== a.payload.outputDataType) return;

        //     if (a.payload.mergeStackInput)
        //     {
        //         const newSubIndex = a.payload.inputJoint.subIndex;
        //         inputRow.incomingElement = [
        //             ...inputRow.incomingElement.slice(0, newSubIndex),
        //             a.payload.outputJoint,
        //             ...inputRow.incomingElement.slice(newSubIndex),
        //         ];
        //     } else {
        //         inputRow.incomingElement = [ a.payload.outputJoint ];
        //     }

        //     g.compilationValidity++;
        // },
        removeIncomingElements: (s, a: UndoAction<{ geometryId: string, joints: GeometryJointLocation[] }>) => {
            const g = getGeometry(s, a);
            if (!g) return;

            for (const joint of a.payload.joints)
            {
                const node = getNode(s, { 
                    payload: {
                        geometryId: a.payload.geometryId, 
                        nodeId: joint.nodeId,
                    }
                }); 
                const outputs = node?.rows[joint.rowId].incomingElements;
                if (outputs) 
                {
                    outputs.splice(joint.subIndex, 1); // Remove desired entry
                } else {
                    console.error(`Output not found`);
                }
            }
            g.compilationValidity++;
        },
        // disconnectJoints: (s, a: UndoAction<{ geometryId: string, joints: JointLocation[] }>) =>
        // {
        //     const g = getGeometry(s, a);
        //     if (!g) return;

        //     for (const joint of a.payload.joints)
        //     {
        //         const node = getNode(s, { 
        //             payload: {
        //                 geometryId: a.payload.geometryId, 
        //                 nodeId: joint.nodeId,
        //             }
        //         }); 

        //         const outputs = node?.rows[joint.rowId].incomingElement;
        //         if (!outputs) 
        //         {
        //             console.error(`Output not found`);
        //             continue;
        //         }

        //         // Remove desired entry
        //         outputs.splice(joint.subIndex, 1);
        //     }

        //     g.compilationValidity++;
        // },
        setSelectedNodes: (s, a: UndoAction<{ geometryId: string, selection: string[] }>) =>
        {
            const g = getGeometry(s, a);
            if (!g) return;
            g.selectedNodes = a.payload.selection;
        },
        resetStateSelected: (s, a: UndoAction<{ geometryId: string }>) =>
        {
            const g = getGeometry(s, a);
            if (!g) return;

            const defaultRowState: { [K in keyof RowS]: true } = {
                'incomingElements': true,
            }

            for (const node of g.nodes) {
                if (!g.selectedNodes.includes(node.id)) continue;
                // for every row of every selected node
                for (const row of Object.values(node.rows)) {
                    // every key of that row
                    for (const key in row) {
                        if (!Object.hasOwn(defaultRowState, key)) {
                            delete row[key as keyof RowS]; // remove if not in default state i.e. not connectedOutputs, etc
                        }
                    }
                }
            }
            g.rowStateValidity++;
        },
    }
});

export const {
    new: geometriesNew,
    remove: geometriesRemove,
    addNode: geometriesAddNode,
    removeNode: geometriesRemoveNode,
    positionNode: geometriesPositionNode,
    moveNodes: geometriesMoveNodes,
    assignRowData: geometriesAssignRowData,
    // connectJoints: geometriesConnectJoints,
    // disconnectJoints: geometriesDisconnectJoints,
    insertIncomingElement: geometriesInsertIncomingElement,
    removeIncomingElements: geometriesRemoveIncomingElements,
    setSelectedNodes: geometriesSetSelectedNodes,
    resetStateSelected: geometriesResetStateSelected,

} = geometriesSlice.actions;

export const selectGeometries = (state: RootState) => state.project.present.geometries;

export const selectGeometry = (geometryId: string) => 
    useCallback((state: RootState) => // memoize selector bc. redux will
        selectGeometries(state)[geometryId] as GeometryS | undefined,
        [ geometryId ]
    );

const geometriesReducer = geometriesSlice.reducer;

export default geometriesReducer;
