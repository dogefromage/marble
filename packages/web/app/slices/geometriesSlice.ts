import { ActionCreator, ActionCreatorWithPayload, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { v4 as uuidv4 } from "uuid";
import { RootState } from "../redux/store";
import { DataTypes, GeometriesSliceState, GeometryS, GNodeS, GNodeT, GNodeTags, JointLocation, Point, ProgramOperationTypes, RowS, UndoAction } from "../types";
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
        outputId: null,
    }

    return geometry;
}

function createDefaultRowState()
{
    const rowS: RowS = {
        connectedOutputs: [],
    }
    return rowS;
}

function createNode(template: GNodeT, nextIdIndex: number, position: Point)
{
    const rows = Object.fromEntries(
        template.rows.map(row => [
            row.id,
            createDefaultRowState()
        ])
    );
    
    template.rows.forEach(row =>
    {
        rows[row.id] = createDefaultRowState();
    });

    const node: GNodeS = 
    {
        id: generateAlphabeticalId(nextIdIndex),
        templateId: template.id,
        position: { ...position },
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

            if (a.payload.template.tags?.includes(GNodeTags.Output))
            {
                g.outputId = node.id;
                g.compilationValidity++;
            }
        },
        removeNode: (s, a: UndoAction<{ geometryId: string, nodeId: string }>) =>
        {
            const g = getGeometry(s, a);
            if (!g) return;

            g.nodes = g.nodes.filter(n => n.id !== a.payload.nodeId);
            
            if (g.outputId === a.payload.nodeId)
                g.outputId = null;

            g.compilationValidity++;
        },
        positionNode: (s, a: UndoAction<{ geometryId: string, nodeId: string, position: Point }>) =>
        {
            const n = getNode(s, a);
            if (!n) return;

            n.position = { ...a.payload.position };
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
        connectJoints: (s, a: UndoAction<{ 
            geometryId: string, 
            inputJoint: JointLocation, 
            inputDataType: DataTypes,
            outputJoint: JointLocation,
            outputDataType: DataTypes,
            isStackedInput?: true,
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

            const inputRow = inputNode.rows[a.payload.inputJoint.rowId];

            if (a.payload.inputDataType !== a.payload.outputDataType) return console.error(`Connected rows must have same dataType`);

            if (a.payload.isStackedInput)
            {
                const newSubIndex = a.payload.inputJoint.subIndex;
                inputRow.connectedOutputs = [
                    ...inputRow.connectedOutputs.slice(0, newSubIndex),
                    a.payload.outputJoint,
                    ...inputRow.connectedOutputs.slice(newSubIndex),
                ];
            }
            else
            {
                inputRow.connectedOutputs = [ a.payload.outputJoint ];
            }

            g.compilationValidity++;
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

                const outputs = node?.rows[joint.rowId].connectedOutputs;
                if (!outputs) 
                {
                    console.error(`Output not found`);
                    continue;
                }

                // Remove desired entry
                outputs.splice(joint.subIndex, 1);
            }

            g.compilationValidity++;
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
