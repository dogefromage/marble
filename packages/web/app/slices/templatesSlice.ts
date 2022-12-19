import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { ProgramInclude, GNodeT, TemplatesSliceState } from "../types";

const initialState: TemplatesSliceState = 
{
    templates: {},
    programIncludes: {}
};

export const templatesSlice = createSlice({
    name: 'templates',
    initialState,
    reducers: {
        addTemplates: (s, a: PayloadAction<{ templates: GNodeT[] }>) => {
            for (const temp of a.payload.templates) {
                s.templates[temp.id] = temp;
            }
        },
        addGLSLSnippets: (s, a: PayloadAction<{ glslSnippets: ProgramInclude[] }>) => {
            for (const snip of a.payload.glslSnippets) {
                s.programIncludes[snip.id] = snip;
            }
        }
    }
});

export const {
    addTemplates: templatesAddTemplates,
    addGLSLSnippets: templatesAddGLSLSnippets,
} = templatesSlice.actions;

export const selectTemplates = (state: RootState) => state.templates;

const templatesReducer = templatesSlice.reducer;

export default templatesReducer;