import { FlowEntryPoint } from "@marble/language";

export interface Layer extends FlowEntryPoint {
    name: string;
    drawIndex: number;
}