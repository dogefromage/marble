import { Dependable } from "../dependencyGraph";
import { DataTypes } from "../layerPrograms";
import { ObjMap, ObjMapUndef } from "../UtilityTypes";
import { GNodeState } from "./GNode";
import { InputRowT, BaseInputRowT, OutputRowT, SpecificRowT } from "./Rows";

export interface GeometryTemplate {
    isRoot: boolean;
    name?: string;
    inputs: InputRowT[];
    outputs: OutputRowT[];
}

export const defaultInputRows: ObjMap<InputRowT> = {
    'position': {
        id: 'position',
        type: 'input',
        name: 'Position',
        dataType: 'vec3',
        value: [ 0, 0, 0 ],
        defaultArgumentToken: 'position',
    }
};

export const defaultOutputRows: ObjMap<OutputRowT> = {
    'solid': {
        id: 'solid',
        type: 'output',
        name: 'Solid',
        dataType: 'Solid',
    }
};

export const rootGeometryTemplate: GeometryTemplate = {
    isRoot: true,
    inputs: [ defaultInputRows['position'] ],
    outputs: [ defaultOutputRows['solid'] ],
}

type GeometrySelections = ObjMapUndef<string[]>; // per user

export interface GeometryS extends Dependable {
    // basic
    name: string;
    // in/out
    isRoot: boolean; // disallows changing of IO
    inputs: InputRowT[];
    outputs: OutputRowT[];
    // content
    nodes: Array<GNodeState>;
    rowStateInvalidator: number;
    nextIdIndex: number;
    selections: GeometrySelections;
}