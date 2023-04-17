import { Dependable } from "../dependencyGraph";

export interface Layer extends Dependable {
    name: string;
    index: number;
    topFlowId: string;
}