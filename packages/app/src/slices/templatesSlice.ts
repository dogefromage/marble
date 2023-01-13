import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { ProgramInclude, GNodeT, TemplatesSliceState } from "../types";

const initialState: TemplatesSliceState = {
    templates: {},
    includes: {}
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
        removeTemplates: (s, a: PayloadAction<{ templateIds: string[] }>) => {
            for (const id of a.payload.templateIds) {
                delete s.templates[id];
            }
        },
        addIncludes: (s, a: PayloadAction<{ includes: ProgramInclude[] }>) => {
            for (const snip of a.payload.includes) {
                s.includes[snip.id] = snip;
            }
        }
    }
});

export const {
    addTemplates: templatesAddTemplates,
    removeTemplates: templatesRemoveTemplates,
    addIncludes: templatesAddGLSLSnippets,
} = templatesSlice.actions;

export const selectTemplates = (state: RootState) => state.templates;

const templatesReducer = templatesSlice.reducer;

export default templatesReducer;