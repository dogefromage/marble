import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { AssetsSliceState } from "../types";
import { SourceTemplate } from '@marble/vite-plugin-glsl-templates';
import { TypeSpecifier } from "@marble/language";

const vec3: TypeSpecifier = {
    type: 'list',
    length: 3,
    elementType: { type: 'primitive', primitive: 'float' },
}

const initialState: AssetsSliceState = {
    signatures: {},
    types: { vec3 },
    glsl: {},
};

export const assetsSlice = createSlice({
    name: 'assets',
    initialState,
    reducers: {
        addTemplates: (s, a: PayloadAction<{ templates: SourceTemplate[] }>) => {
            for (const temp of a.payload.templates) {
                if (temp.type === 'signature') {
                    const id = temp.signature.id;
                    s.signatures[id] = temp.signature;
                    s.glsl[id] = temp.glsl;
                } else {
                    throw new Error(`Unknown template type`);
                }
            }
        },
    }
});

export const {
    addTemplates: assetsAddTemplates,
} = assetsSlice.actions;

export const selectAssets = (state: RootState) => state.assets;

const assetsReducer = assetsSlice.reducer;

export default assetsReducer;