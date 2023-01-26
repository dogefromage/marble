import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { DependencyNodeKey, DependencyGraphNode, DependencyGraphSliceState } from "../types";
import createDependencyOrdering from "../utils/dependencyGraph/createDependencyOrdering";

const initialState: DependencyGraphSliceState = {
    nodes: new Map(),
    order: new Map(),
};

export const dependencyGraphSlice = createSlice({
    name: 'dependencyGraph',
    initialState,
    reducers: {
        updateGraph: (s, a: PayloadAction<{ removeNodes: DependencyNodeKey[], addNodes: DependencyGraphNode[] }>) => {
            // remove old
            for (const nodeId of a.payload.removeNodes) {
                s.nodes.delete(nodeId);
            }
            // add new
            for (const node of a.payload.addNodes) {
                if (s.nodes.has(node.key)) {
                    console.error(`Node "${node.key}" already in dep. graph`);
                    continue;
                }
                s.nodes.set(node.key, node);
            }
            s.order = createDependencyOrdering(s.nodes);
        },
    }
});

export const {
    updateGraph: dependencyGraphUpdateGraph,
} = dependencyGraphSlice.actions;

export const selectDependencyGraph = (state: RootState) => state.runtime.dependencyGraph;

const dependencyGraphReducer = dependencyGraphSlice.reducer;

export default dependencyGraphReducer;