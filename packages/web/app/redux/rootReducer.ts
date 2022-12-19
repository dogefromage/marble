import { combineReducers } from "@reduxjs/toolkit";
import localStorageEnhancer from "../enhancers/localStorageEnhancer";
import undoableEnhancer from "../enhancers/undoableEnhancer";
import commandsReducer from "../slices/commandsSlice";
import consoleReducer from "../slices/consoleSlice";
import contextMenuReducer from "../slices/contextMenuSlice";
import geometriesReducer from "../slices/geometriesSlice";
import geometryEditorPanelsReducer from "../slices/panelGeometryEditorSlice";
import panelManagerReducer from "../slices/panelManagerSlice";
import viewportPanelsReducer from "../slices/panelViewportSlice";
import preferencesReducer from "../slices/preferencesSlice";
import sceneProgramReducer from "../slices/sceneProgramSlice";
import templatesReducer from "../slices/templatesSlice";
import worldReducer from "../slices/worldSlice";
import { ViewTypes } from "../types";

const rootReducer = combineReducers({
    project: undoableEnhancer(
        localStorageEnhancer(
            combineReducers({
                world: worldReducer,
                geometries: geometriesReducer,
            }),
            'project'
        )
    ),
    editor: combineReducers({
        panels: combineReducers({
            [ViewTypes.GeometryEditor]: geometryEditorPanelsReducer,
            [ViewTypes.Viewport]: viewportPanelsReducer,
        }),
        panelManager: panelManagerReducer,
        preferences: preferencesReducer,
    }),
    sceneProgram: sceneProgramReducer,
    templates: templatesReducer,
    commands: commandsReducer,
    contextMenu: contextMenuReducer,
    console: consoleReducer,
});

export default rootReducer;