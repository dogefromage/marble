import { combineReducers } from "@reduxjs/toolkit";
import undoableEnhancer from "../enhancers/undoableEnhancer";
import geometriesReducer from "../slices/GeometriesSlice/geometriesSlice";

const reducer = combineReducers({
    project: undoableEnhancer(
        combineReducers({
            geometries: geometriesReducer,
        })
    ),
    // editor: combineReducers({
    //     panelManager: panelManagerReducer,
    //     preferences: preferencesReducer,
    // }),
});

export default reducer;