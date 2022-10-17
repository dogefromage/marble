import { PayloadAction } from "@reduxjs/toolkit";
import { ObjMap, PanelState } from "../../types";

export default function getPanelState<T extends PanelState>(s: ObjMap<T>, a: PayloadAction<{ panelId: string }>)
{
    const ps = s[a.payload.panelId];
    if (!ps) return console.error(`Panel state not found panelId=${a.payload.panelId}`);
    return ps;
}