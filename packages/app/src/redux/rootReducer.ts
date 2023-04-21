import { combineReducers } from "@reduxjs/toolkit";
import localStorageEnhancer from "../enhancers/localStorageEnhancer";
import undoableEnhancer from "../enhancers/undoableEnhancer";
import commandsReducer from "../slices/commandsSlice";
import consoleReducer from "../slices/consoleSlice";
import contextMenuReducer from "../slices/contextMenuSlice";
import flowsReducer from "../slices/flowsSlice";
import layerProgramsReducer from "../slices/layerProgramsSlice";
import layersReducer from "../slices/layersSlice";
import menusReducer from "../slices/menusSlice";
import flowEditorPanelsReducer from "../slices/panelFlowEditorSlice";
import panelManagerReducer from "../slices/panelManagerSlice";
import viewportPanelsReducer from "../slices/panelViewportSlice";
import worldReducer from "../slices/worldSlice";
import { ViewTypes } from "../types";
// import assetsReducer from "../slices/assetsSlice";
import contextReducer from "../slices/contextSlice";

const rootReducer = combineReducers({
    recorded: undoableEnhancer(
        combineReducers({
            project: localStorageEnhancer(
                combineReducers({
                    world: worldReducer,
                    flows: flowsReducer,
                    layers: layersReducer,
                }),
                'project',
            ),
            context: contextReducer,
            layerPrograms: layerProgramsReducer,
            // dependencyGraph: dependencyGraphReducer,
        }),
    ),
    editor: combineReducers({
        panels: combineReducers({
            [ViewTypes.FlowEditor]: flowEditorPanelsReducer,
            [ViewTypes.Viewport]: viewportPanelsReducer,
        }),
        panelManager: panelManagerReducer,
    }),
    // assets: assetsReducer,
    console: consoleReducer,
    menus: menusReducer,
    contextMenu: contextMenuReducer,
    commands: commandsReducer,
});

export default rootReducer;