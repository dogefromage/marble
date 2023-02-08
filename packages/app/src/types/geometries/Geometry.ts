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
    selections: ObjMapUndef<string[]>;
}