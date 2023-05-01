import { combineReducers } from "@reduxjs/toolkit";
import storageEnhancer from "../enhancers/storageEnhancer";
import undoableEnhancer from "../enhancers/undoableEnhancer";
import appReducer from "../slices/appSlice";
import commandsReducer from "../slices/commandsSlice";
import contextMenuReducer from "../slices/contextMenuSlice";
import contextReducer from "../slices/contextSlice";
import flowsReducer from "../slices/flowsSlice";
import layerProgramsReducer from "../slices/layerProgramsSlice";
import layersReducer from "../slices/layersSlice";
import menusReducer from "../slices/menusSlice";
import flowEditorPanelsReducer from "../slices/panelFlowEditorSlice";
import panelManagerReducer from "../slices/panelManagerSlice";
import viewportPanelsReducer from "../slices/panelViewportSlice";
import worldReducer from "../slices/worldSlice";
import { ViewTypes } from "../types";
import { getAndDeserializeLocalProject, serializeAndStoreProjectLocally } from "../utils/projectStorage";

const projectReducer = combineReducers({
    world: worldReducer,
    flows: flowsReducer,
    layers: layersReducer,
});
// export type ProjectState = ReturnType<typeof projectReducer>;

const rootReducer = combineReducers({
    recorded: undoableEnhancer(
        combineReducers({
            project: 
            storageEnhancer(
                projectReducer,
                getAndDeserializeLocalProject,
                serializeAndStoreProjectLocally,
            ),
            context: contextReducer,
            layerPrograms: layerProgramsReducer,
        }),
    ),
    app: appReducer,
    panels: combineReducers({
        [ViewTypes.FlowEditor]: flowEditorPanelsReducer,
        [ViewTypes.Viewport]: viewportPanelsReducer,
    }),
    panelManager: panelManagerReducer,
    menus: menusReducer,
    contextMenu: contextMenuReducer,
    commands: commandsReducer,
});

export default rootReducer;