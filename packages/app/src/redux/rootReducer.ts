import { combineReducers } from "@reduxjs/toolkit";
import localStorageEnhancer from "../enhancers/localStorageEnhancer";
import undoableEnhancer from "../enhancers/undoableEnhancer";
import commandsReducer from "../slices/commandsSlice";
import consoleReducer from "../slices/consoleSlice";
import contextMenuReducer from "../slices/contextMenuSlice";
import dependencyGraphReducer from "../slices/dependencyGraphSlice";
import geometriesReducer from "../slices/geometriesSlice";
import geometryDatasReducer from "../slices/geometryDatasSlice";
import layerProgramsReducer from "../slices/layerProgramsSlice";
import layersReducer from "../slices/layersSlice";
import menusReducer from "../slices/menusSlice";
import geometryEditorPanelsReducer from "../slices/panelGeometryEditorSlice";
import panelManagerReducer from "../slices/panelManagerSlice";
import viewportPanelsReducer from "../slices/panelViewportSlice";
import templatesReducer from "../slices/templatesSlice";
import worldReducer from "../slices/worldSlice";
import { ViewTypes } from "../types";

const rootReducer = combineReducers({
    recorded: undoableEnhancer(
        combineReducers({
            project: localStorageEnhancer(
                combineReducers({
                    world: worldReducer,
                    geometries: geometriesReducer,
                    layers: layersReducer,
                }),
                'project'
            ),
            geometryDatas: geometryDatasReducer,
            dependencyGraph: dependencyGraphReducer,
            layerPrograms: layerProgramsReducer,
            templates: templatesReducer,    
        })
    ),
    editor: combineReducers({
        panels: combineReducers({
            [ViewTypes.GeometryEditor]: geometryEditorPanelsReducer,
            [ViewTypes.Viewport]: viewportPanelsReducer,
        }),
        panelManager: panelManagerReducer,
    }),
    console: consoleReducer,
    menus: menusReducer,
    contextMenu: contextMenuReducer,
    commands: commandsReducer,
});

export default rootReducer;