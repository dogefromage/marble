import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { GLSLSnippet, GNodeT, TemplatesSliceState } from "../types";

const initialState: TemplatesSliceState = 
{
    templates: {},
    glslSnippets: {}
};

export const templatesSlice = createSlice({
    name: 'templates',
    initialState,
    reducers: {
        addTemplate: (s, a: PayloadAction<{ template: GNodeT }>) =>
        {
            s.templates[a.payload.template.id] = a.payload.template;
        },
        addGLSLSnippet: (s, a: PayloadAction<{ glslSnippet: GLSLSnippet }>) =>
        {
            s.glslSnippets[a.payload.glslSnippet.id] = a.payload.glslSnippet;
        }
    }
});

export const {
    addTemplate: templatesAddTemplate,
    addGLSLSnippet: templatesAddGLSLSnippet,
} = templatesSlice.actions;

export const selectTemplates = (state: RootState) => state.templates;

const templatesReducer = templatesSlice.reducer;

export default templatesReducer;