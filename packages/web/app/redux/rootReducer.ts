import { combineReducers } from "@reduxjs/toolkit";
import undoableEnhancer from "../enhancers/undoableEnhancer";
import geometriesReducer from "../slices/geometriesSlice";
import viewportPanelsReducer from "../slices/panelViewportSlice";
import sceneProgramReducer from "../slices/sceneProgramSlice";
import templatesReducer from "../slices/templatesSlice";

const rootReducer = combineReducers({
    project: undoableEnhancer(
        combineReducers({
            geometries: geometriesReducer,
        })
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