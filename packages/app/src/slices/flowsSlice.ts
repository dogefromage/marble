import { AnonymousFunctionSignature, FlowGraph, FlowNode, FunctionSignatureId, InputJointLocation, JointLocation, OutputJointLocation } from "@marble/language";
import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";
import { useCallback } from "react";
import { RootState } from "../redux/store";
import { FlowsSliceState, Vec2, UndoAction } from "../types";
import { enableMapSet } from "immer";
enableMapSet();

function getFlow(s: FlowsSliceState, a: { payload: { flowId: string } }) {
    const g = s[a.payload.flowId];
    if (!g) return console.error(`Flow with id ${a.payload.flowId} not found`);
    return g;
}

function getNode(s: FlowsSliceState, a: { payload: { flowId: string, nodeId: string } }) {
    const n = getFlow(s, a)?.nodes[a.payload.nodeId];
    if (!n) return console.error(`Node with id ${a.payload.nodeId} not found`);
    return n;
}

function removeConnectionsToNodes(g: FlowGraph, nodes: Set<string>) {
    for (const node of Object.values(g.nodes)) {
        for (const [ rowId, rowState ] of Object.entries(node.rowStates)) {
            for (let i = rowState.connections.length - 1; i >= 0; i--) {
                const conn = rowState.connections[i];
                if (nodes.has(conn.nodeId)) {
                    rowState.connections.splice(i, 1);
                }
            }
        }
    }
}

// function removeIncomingElements(s: FlowsSliceState, flowId: string, elements: FlowJointLocation[]) {
//     for (const element of elements) {
//         const node = getNode(s, {
//             payload: { flowId, nodeId: element.nodeId }
//         });
//         const outputs = node?.rows?.[ element.rowId ]?.incomingElements;
//         if (outputs) {
//             outputs.splice(element.subIndex, 1); // Remove desired entry
//         } else {
//             console.error(`Output not found`);
//         }
//     }
// }

// function createBlankRow(id: string, rowAndDataType: RowDataTypeCombination): RowT {
//     const displayName = allowedInputRows[rowAndDataType] || allowedOutputRows[rowAndDataType];
//     const rowName = `New ` + (displayName || 'Row');

//     const { rowType, dataType } = decomposeRowDataTypeCombination(rowAndDataType);

//     switch (rowType) {
//         case 'field':
//         case 'input':
//         case 'output':
//             return {
//                 id, type: rowType, dataType, name: rowName,
//                 value: initialDataTypeValue[dataType],
//             }
//         case 'rotation':
//             return {
//                 id,
//                 type: 'rotation', 
//                 dataType: 'mat3',
//                 name: rowName,
//                 value: initialDataTypeValue['mat3'],
//                 rotationModel: 'xyz',
//             }
//         case 'color':
//             return {
//                 id,
//                 type: 'color', 
//                 dataType: 'vec3',
//                 name: rowName,
//                 value: [ 1, 1, 1 ],
//             }
//         default: 
//             throw new Error(`${rowAndDataType} not implemented`);
//     }
// }

export function generateNodeId(index: number) {
    return index.toString(36);
}

const initialState: FlowsSliceState = {};

export const flowsSlice = createSlice({
    name: 'flows',
    initialState,
    reducers: {
        create: (s, a: UndoAction<{
            name: string;
            flowId?: string;
            signature: AnonymousFunctionSignature,
        }>) => {
            const id = a.payload.flowId || _.snakeCase(a.payload.name);
            if (!/^\w+$/.test(id)) {
                throw new Error(`Invalid characters in id`);
            }
            if (s[id] != null) {
                throw new Error(`Flow with id ${id} already exists!`);
            }
            const flow: FlowGraph = {
                id,
                name: a.payload.name,
                nodes: {},
                version: 0,
                inputs: a.payload.signature.inputs,
                outputs: a.payload.signature.outputs,
                nextIdIndex: 10, // start at "a"
            }
            s[id] = flow;
        },
        rename: (s, a: UndoAction<{ flowId: string, name: string }>) => {
            const g = getFlow(s, a);
            if (!g) return;
            g.name = a.payload.name;
            g.version++;

        },
        remove: (s, a: UndoAction<{ flowId: string }>) => {
            delete s[a.payload.flowId];
        },
        addNode: (s, a: UndoAction<{ flowId: string, signatureId: FunctionSignatureId, position: Vec2 }>) => {
            const g = getFlow(s, a);
            if (!g) return;
            const node: FlowNode = {
                id: generateNodeId(g.nextIdIndex++),
                signature: a.payload.signatureId,
                rowStates: {},
                position: a.payload.position,
            }
            g.nodes[node.id] = node;
            g.version++;
        },
        removeNodes: (s, a: UndoAction<{ flowId: string, selection: string[] }>) => {
            const g = getFlow(s, a);
            if (!g) return;
            const targets = a.payload.selection;
            if (targets.length > 0) {
                for (const id of targets) {
                    delete g.nodes[id];
                }
                removeConnectionsToNodes(g, new Set(targets));
                g.version++;
            }
        },
        positionNode: (s, a: UndoAction<{ flowId: string, nodeId: string, position: Vec2 }>) => {
            const n = getNode(s, a);
            if (!n) return;
            n.position = { ...a.payload.position };
        },
        moveSelection: (s, a: UndoAction<{ flowId: string, selection: string[], delta: Vec2 }>) => {
            const g = getFlow(s, a);
            if (!g) return;
            for (const id of a.payload.selection) {
                const node = g.nodes[id];
                if (!node) continue;
                node.position.x += a.payload.delta.x;
                node.position.y += a.payload.delta.y;
            }
        },
        // assignRowData: (s, a: UndoAction<{ flowId: string, nodeId: string, rowId: string, rowData?: Partial<RowS> }>) => {
        //     const n = getNode(s, a);
        //     if (!n) return;
        //     if (a.payload.rowData) {
        //         const superDefault: BaseRowS = {
        //             incomingElements: [],
        //         }
        //         // @ts-ignore
        //         n.rows[ a.payload.rowId ] = {
        //             ...superDefault,
        //             ...n.rows[ a.payload.rowId ],
        //             ...a.payload.rowData,
        //         }
        //     }
        //     else {
        //         delete n.rows[ a.payload.rowId ];
        //     }
        //     const g = getFlow(s, a)!;
        //     g.rowStateInvalidator++;
        // },
        addLink: (s, a: UndoAction<{
            flowId: string,
            locations: [JointLocation, JointLocation],
        }>) => {
            const g = getFlow(s, a);
            if (!g) return;

            const inputLocation = a.payload.locations
                .find(l => l.direction === 'input') as InputJointLocation | undefined;
            const outputLocation = a.payload.locations
                .find(l => l.direction === 'output') as OutputJointLocation | undefined;
            if (!inputLocation || !outputLocation) {
                return console.error(`Must provide both input and output location`);
            }

            const inputNode = getNode(s, {
                payload: {
                    nodeId: inputLocation.nodeId,
                    flowId: a.payload.flowId,
                }
            });
            if (!inputNode) return console.error(`Couldn't find input node`);
            
            inputNode.rowStates[inputLocation.rowId] ||= { connections: [], state: {} };
            const connections = inputNode.rowStates[inputLocation.rowId]!.connections;
            const setIndex = Math.max(0, Math.min(inputLocation.jointIndex, connections.length));
            connections[setIndex] = {
                nodeId: outputLocation.nodeId,
                outputId: outputLocation.rowId,
            }

            // const defaultInputRow: RowS = { incomingElements: [] };
            // const inputRow = inputNode.rows[ a.payload.jointLocation.rowId ] || defaultInputRow;
            // inputNode.rows[ a.payload.jointLocation.rowId ] = inputRow;

            // if (a.payload.isStackedInput) {
            //     const newSubIndex = a.payload.jointLocation.subIndex;
            //     inputRow.incomingElements = [
            //         ...inputRow.incomingElements.slice(0, newSubIndex),
            //         a.payload.incomingElement,
            //         ...inputRow.incomingElements.slice(newSubIndex),
            //     ];
            // } else {
            //     inputRow.incomingElements = [ a.payload.incomingElement ];
            // }

            g.version++;
        },
        removeEdge: (s, a: UndoAction<{ flowId: string, input: InputJointLocation }>) => {
            const g = getFlow(s, a);
            if (!g) return;
            const { nodeId, rowId, jointIndex } = a.payload.input;
            g.nodes[nodeId]?.rowStates[rowId]?.connections.splice(jointIndex, 1);
            g.version++;
        },
        // setUserSelection: (s, a: UndoAction<{ flowId: string, userId: string, selection: string[] }>) => {
        //     const g = getFlow(s, a);
        //     if (!g) return;
        //     // remove nodeIds from other peoples selection
        //     for (const userId of Object.keys(g.selections)) {
        //         g.selections[userId] = g.selections[userId]!
        //             .filter(nodeId => !a.payload.selection.includes(nodeId));
        //     }
        //     g.selections[a.payload.userId] = a.payload.selection;
        // },
        // resetUserSelectedNodes: (s, a: UndoAction<{ flowId: string, userId: string }>) => {
        //     const g = getFlow(s, a);
        //     if (!g) return;
        //     const defaultRowState: { [ K in keyof RowS ]: true } = {
        //         'incomingElements': true,
        //     }
        //     const userSelection = g.selections[a.payload.userId] || [];
        //     const selectedNodes = g.nodes.filter(node => userSelection.includes(node.id));
        //     for (const node of selectedNodes) {
        //         for (const row of Object.values(node.rows)) {
        //             for (const key in row) {
        //                 if (!Object.hasOwn(defaultRowState, key)) {
        //                     delete row[ key as keyof RowS ]; // remove if not in default state i.e. not connectedOutputs, etc
        //                 }
        //             }
        //         }
        //         node.templateVersion = -1; // expire state
        //     }
        //     g.rowStateInvalidator++;
        // },
        // updateExpiredProps: (s, a: PayloadAction<{
        //     flows: { flowId: string, flowVersion: number, expiredProps: FlowConnectionData[ 'expiredProps' ] }[];
        // }>) => {

        //     for (const { flowId, flowVersion, expiredProps } of a.payload.flows) {
        //         const g = getFlow(s, { payload: { flowId } });
        //         if (!g) return;

        //         if (flowVersion < g.version) {
        //             continue; // the task is outdated / duplicate
        //         }

        //         // remove all stray joints
        //         removeIncomingElements(s, flowId, expiredProps.strayJoints);

        //         const superDefaultRow: BaseRowS = { incomingElements: [] };

        //         // update templates
        //         for (const { nodeIndex, template } of expiredProps.expiredNodeStates) {
        //             const node = g.nodes[ nodeIndex ];
        //             if (node.templateId !== template.id) {
        //                 throw new Error(`wrong template passed`);
        //             }
        //             // find unnecessary row state
        //             for (const rowId in node.rows) {
        //                 if (template.rows.find(row => row.id === rowId) == null) {
        //                     delete node.rows[ rowId ]; // this rowstate is outdated
        //                 }
        //             }
        //             // add missing row state
        //             for (let rowIndex = 0; rowIndex < template.rows.length; rowIndex++) {
        //                 const rowId = template.rows[ rowIndex ].id;
        //                 if (node.rows[ rowId ] == null) {
        //                     node.rows[ rowId ] = superDefaultRow;
        //                 }
        //             }

        //             node.templateVersion = template.version;
        //         }
        //         g.version++;
        //     }
        // },
        // addCustomRow: (s, a: UndoAction<{ flowId: string, direction: 'in' | 'out', rowAndDataType: RowDataTypeCombination }>) => {
        //     const g = getFlow(s, a);
        //     if (!g) return;
        //     // prefix r so it can be a variable name
        //     const id = "r_" + generateAlphabeticalId(g.nextIdIndex++); 
        //     if (a.payload.direction === 'in') {
        //         g.inputs.push(createBlankRow(id, a.payload.rowAndDataType) as InputRowT);
        //     } else {
        //         g.outputs.push(createBlankRow(id, a.payload.rowAndDataType) as OutputRowT);
        //     }
        //     g.version++;
        // },
        // addDefaultRow: (s, a: UndoAction<{ flowId: string, direction: 'in' | 'out', defaultRow: InputRowT | OutputRowT }>) => {
        //     const g = getFlow(s, a);
        //     if (!g) return;
        //     if (a.payload.direction === 'in') {
        //         if (g.inputs.find(row => row.id === a.payload.defaultRow.id)) {
        //             return; // only one instance
        //         }
        //         g.inputs.push(a.payload.defaultRow as InputRowT);
        //     } else {
        //         if (g.outputs.find(row => row.id === a.payload.defaultRow.id)) {
        //             return; // only one instance
        //         }
        //         g.outputs.push(a.payload.defaultRow as OutputRowT);
        //     }
        //     g.version++;
        // },
        // replaceRow: (s, a: UndoAction<{ flowId: string, direction: 'in' | 'out', rowId: string, rowAndDataType: RowDataTypeCombination }>) => {
        //     const g = getFlow(s, a);
        //     if (!g) return;

        //     const rows: RowT[] = a.payload.direction === 'in' ? g.inputs : g.outputs;
        //     const index = rows.findIndex(row => row.id === a.payload.rowId);
        //     const newRow = createBlankRow(a.payload.rowId, a.payload.rowAndDataType);
        //     newRow.name = rows[index].name; // manual name copy
        //     rows.splice(index, 1, newRow);
        //     g.version++;
        // },
        // updateRow: (s, a: UndoAction<{ flowId: string, direction: 'in' | 'out', rowId: string, newState: Partial<RowT> }>) => {
        //     const g = getFlow(s, a);
        //     if (!g) return;

        //     const rows: RowT[] = a.payload.direction === 'in' ? g.inputs : g.outputs;
        //     const row = rows.find(row => row.id === a.payload.rowId);
        //     if (!row) {
        //         return console.error(`Row not found`);
        //     }
        //     Object.assign(row, a.payload.newState);
        //     g.version++;
        // },
        // removeRow: (s, a: UndoAction<{ flowId: string, direction: 'in' | 'out', rowId: string }>) => {
        //     const g = getFlow(s, a);
        //     if (!g) return;
        //     const filter = (row: RowT) => row.id != a.payload.rowId;
        //     if (a.payload.direction === 'in') {
        //         g.inputs = g.inputs.filter(filter);
        //     } else {
        //         g.outputs = g.outputs.filter(filter);
        //     }
        //     g.version++;
        // },
        // reorderRows: (s, a: UndoAction<{ flowId: string, direction: 'in' | 'out', newOrder: string[] }>) => {
        //     const g = getFlow(s, a);
        //     if (!g) return;
        //     // get
        //     const rows: RowT[] = a.payload.direction === 'in' ? g.inputs : g.outputs;
        //     // map
        //     const newRows = a.payload.newOrder
        //         .map(rowId => rows.find(row => row.id === rowId));
        //     if (!newRows.every(row => row != null)) {
        //         console.error('Invalid row ids passed');
        //     }
        //     // put
        //     if (a.payload.direction === 'in') {
        //         g.inputs = newRows as InputRowT[];
        //     } else {
        //         g.outputs = newRows as OutputRowT[];
        //     }
        //     g.version++;
        // },
    }
});

export const {
    // CRUD
    create: flowsCreate,
    rename: flowsRename,
    remove: flowsRemove,
    // CONTENT
    addNode: flowsAddNode,
    removeNodes: flowsRemoveNodes,
    positionNode: flowsPositionNode,
    moveSelection: flowsMoveSelection,
    addLink: flowsAddLink,
    removeEdge: flowsRemoveEdge,
    // setUserSelection: flowsSetUserSelection,
    // resetUserSelectedNodes: flowsResetUserSelectedNodes,
    // updateExpiredProps: flowsUpdateExpiredProps,
    // // META
    // addCustomRow: flowsAddCustomRow,
    // addDefaultRow: flowsAddDefaultRow,
    // updateRow: flowsUpdateRow,
    // removeRow: flowsRemoveRow,
    // replaceRow: flowsReplaceRow,
    // reorderRows: flowsReorderRows,
} = flowsSlice.actions;

export const selectFlows = (state: RootState) => state.recorded.present.project.flows;

export const selectSingleFlow = (flowId: string) =>
    useCallback((state: RootState) => // memoize selector IMPORTANT
        selectFlows(state)[flowId],
        [flowId]
    );

const flowsReducer = flowsSlice.reducer;

export default flowsReducer;
