import { Dependable } from "../dependencyGraph";
import { StaticDataTypes } from "../programs";
import { GNodeState } from "./GNode";
import { RowValueMap } from "./Rows";

export interface GeometryArgument<D extends StaticDataTypes = StaticDataTypes> {
    id: string;
    name: string;
    dataType: D;
    defaultValue: RowValueMap[ D ]
}

export type DefaultArgumentIds = 'position';

export const rootGeometryArguments: GeometryArgument[] = [
    {
        id: 'position',
        name: 'Position',
        dataType: 'vec3',
        defaultValue: [ 0, 0, 0 ],
    },
];

export interface GeometryTemplate {
    isRoot: boolean;
    arguments: GeometryArgument[];
    returnType: StaticDataTypes;
    name?: string;
}

export const ROOT_GEOMETRY_TEMPLATE: GeometryTemplate = {
    isRoot: true,
    arguments: rootGeometryArguments,
    returnType: 'Solid',
}

export interface GeometryS extends Dependable {
    // basic
    name: string;
    isRoot: boolean;
    // in/out
    arguments: GeometryArgument[];
    returnType: StaticDataTypes;
    // content
    nodes: Array<GNodeState>;
    rowStateInvalidator: number;
    nextIdIndex: number;
    selectedNodes: string[];
}