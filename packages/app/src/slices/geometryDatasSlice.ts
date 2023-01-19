import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useCallback } from "react";
import { RootState } from "../redux/store";
import { GeometryConnectionData, GeometryDatasSliceState } from "../types";

const initialState: GeometryDatasSliceState = {};

export const geometryDatasSlice = createSlice({
    name: 'geometryDatas',
    initialState,
    reducers: {
        setMany: (s, a: PayloadAction<{ setDatas: GeometryConnectionData[], removeDatas: string[] }>) => {
            for (const id of a.payload.removeDatas) {
                delete s[id];
            }
            for (const d of a.payload.setDatas) {
                s[d.geometryId] = d;
            }
        }
    }
});

export const {
    setMany: geometryDatasSetMany,
} = geometryDatasSlice.actions;

export const selectGeometryDatas = (state: RootState) => state.runtime.geometryDatas;

export const selectSingleGeometryData = (geometryId: string) => 
    useCallback((state: RootState) => // memoize selector bc. redux will
        selectGeometryDatas(state)[geometryId] as GeometryConnectionData | undefined,
        [ geometryId ],
    );

const geometryDatasReducer = geometryDatasSlice.reducer;

export default geometryDatasReducer;