import { combineReducers } from "@reduxjs/toolkit";
import undoableEnhancer from "../enhancers/undoableEnhancer";
import geometriesReducer from "../slices/geometriesSlice";
import viewportPanelsReducer from "../slices/panelViewportSlice";

const reducer = combineReducers({
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
});

export default reducer;