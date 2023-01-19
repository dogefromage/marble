import { IDependency } from "../dependencyGraph";
import { DataTypes } from "../program";
import { GNodeS } from "./GNode";
import { RowValueMap } from "./Rows";

export interface GeometryArgument<D extends DataTypes = DataTypes>
{
    id: string;
    name: string;
    dataType: D;
    defaultValue: RowValueMap[D]
}

export enum DefaultArgumentIds {
    RayPosition = 'position',
}

export const ROOT_GEOMETRY_ARGUMENTS: GeometryArgument[] = [
    {
        id: DefaultArgumentIds.RayPosition,
        name: 'Position',
        dataType: DataTypes.Vec3,
        defaultValue: [ 0, 0, 0 ],
    },
];

export interface GeometryTemplate {
    isRoot: boolean;
    arguments: GeometryArgument[];
    returnType: DataTypes;
}

export const ROOT_GEOMETRY_TEMPLATE: GeometryTemplate = {
    isRoot: true,
    arguments: ROOT_GEOMETRY_ARGUMENTS,
    returnType: DataTypes.Solid,
}

export interface GeometryS extends IDependency
{
    // basic
    name: string;
    isRoot: boolean;
    // in/out
    arguments: GeometryArgument[];
    returnType: DataTypes;
    // content
    nodes: Array<GNodeS>;
    rowStateInvalidator: number;
    nextIdIndex: number;
    selectedNodes: string[];
}