import { combineReducers } from "@reduxjs/toolkit";
import localStorageEnhancer from "../enhancers/localStorageEnhancer";
import undoableEnhancer from "../enhancers/undoableEnhancer";
import geometriesReducer from "../slices/geometriesSlice";
import viewportPanelsReducer from "../slices/panelViewportSlice";
import sceneProgramReducer from "../slices/sceneProgramSlice";
import templatesReducer from "../slices/templatesSlice";

const rootReducer = combineReducers({
    project: undoableEnhancer(
        localStorageEnhancer(
            combineReducers({
                geometries: geometriesReducer,
            }),
            'project'
        )
    ),
    editor: combineReducers({
        panels: combineReducers({
            viewport: viewportPanelsReducer,
        })
        // panelManager: panelManagerReducer,
        // preferences: preferencesReducer,
    }),
    sceneProgram: sceneProgramReducer,
    templates: templatesReducer,
});

export default rootReducer;