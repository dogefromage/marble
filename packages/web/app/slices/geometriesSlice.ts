import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { UndoAction } from "../types/undoable";
import { RootState } from "../redux/store";
import { GeometryS, GNodeT, GNodeS, JointLocation } from "../types";
import { Point } from "../types/utils";
import generateAlphabeticalId from "../utils/generateAlphabeticalId";
import { GeometriesSliceState } from "../types/SliceStates";

function createGeometry(id: string)
{
    const geometry: GeometryS =
    {
        id,
        name: 'New Geometry',
        nodes: [],
        validity: 0,
        nextIdIndex: 0,
    }

    return geometry;
}

function createNode(template: GNodeT, nextIdIndex: number, position: Point)
{
    const node: GNodeS = 
    {
        id: generateAlphabeticalId(nextIdIndex),
        templateId: template.id,
        position: { ...position },
        rows: {},
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
        },
        removeNode: (s, a: UndoAction<{ geometryId: string, nodeId: string }>) =>
        {
            const g = getGeometry(s, a);
            if (!g) return;

            g.nodes = g.nodes.filter(n => n.id !== a.payload.nodeId);
            g.validity++;
        },
        positionNode: (s, a: UndoAction<{ geometryId: string, nodeId: string, position: Point }>) =>
        {
            const n = getNode(s, a);
            if (!n) return;

            n.position = { ...a.payload.position };
        },
        assignRowData: (s, a: UndoAction<{ geometryId: string, nodeId: string, rowId: string, rowData?: any }>) =>
        {
            const n = getNode(s, a);
            if (!n) return;

            if (a.payload.rowData)
            {
                n.rows[a.payload.rowId] = {
                    ...n.rows[a.payload.rowId],
                    ...a.payload.rowData,
                }
            }
            else
            {
                delete n.rows[a.payload.rowId];
            }
        },
        connectJoints: (s, a: UndoAction<{ 
            geometryId: string, 
            inputJoint: JointLocation, 
            outputJoint: JointLocation, 
        }>) =>
        {
            const g = getGeometry(s, a);
            if (!g) return;

            const inputNode = getNode(s, { 
                payload: {
                    nodeId: a.payload.inputJoint.nodeId,
                    geometryId: a.payload.geometryId, 
                }
            }); 
            if (!inputNode) return;

            const inputRow = inputNode.rows[a.payload.inputJoint.rowId] || {};
            inputNode.rows[a.payload.inputJoint.rowId] = inputRow;

            inputRow.connectedOutput = 
            { 
                nodeId: a.payload.outputJoint.nodeId,
                rowId: a.payload.outputJoint.rowId,
            };

            g.validity++;
        },
        disconnectJoints: (s, a: UndoAction<{ geometryId: string, joints: JointLocation[] }>) =>
        {
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

                delete node?.rows[joint.rowId]?.connectedOutput;
            }

            g.validity++;
        },
    }
});

export const {
    new: geometriesNew,
    remove: geometriesRemove,
    addNode: geometriesAddNode,
    removeNode: geometriesRemoveNode,
    positionNode: geometriesPositionNode,
    assignRowData: geometriesAssignRowData,
    connectJoints: geometriesConnectJoints,
    disconnectJoints: geometriesDisconnectJoints,
} = geometriesSlice.actions;

export const selectGeometries = (state: RootState) => state.project.present.geometries;

const geometriesReducer = geometriesSlice.reducer;

export default geometriesReducer;
