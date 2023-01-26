import { Dependable } from "../dependencyGraph";
import { DataTypes } from "../layerPrograms";
import { GNodeState } from "./GNode";
import { InputRowT, OutputRowT } from "./Rows";

export interface GeometryTemplate {
    name?: string;
    inputs: InputRowT[];
    outputs: OutputRowT[];
}

export const rootGeometryTemplate: GeometryTemplate = {
    inputs: [
        {
            id: 'position',
            type: 'input',
            name: 'Position',
            dataType: 'vec3',
            value: [ 0, 0, 0 ],
        },
    ],
    outputs: [
        {
            id: 'solid',
            type: 'output',
            name: 'Solid',
            dataType: 'Solid',
        }
    ],
}

export interface GeometryS extends Dependable {
    // basic
    name: string;
    // in/out
    inputs: InputRowT[];
    outputs: OutputRowT[];
    // content
    nodes: Array<GNodeState>;
    rowStateInvalidator: number;
    nextIdIndex: number;
    selectedNodes: string[];
}