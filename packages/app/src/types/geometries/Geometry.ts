import { DataTypes } from "../program";
import { GNodeS } from "./GNode";
import { GeometryArgument } from "./Rows";

export enum GeometryType 
{
    Root = 'root',
    Sub = 'sub',
}

export interface GeometryS
{
    // basic
    id: string;
    name: string;
    type: GeometryType;

    // in/out
    arguments: GeometryArgument[];
    returnType: DataTypes;
    
    // content
    nodes: Array<GNodeS>;
    version: number;
    rowStateInvalidator: number;
    nextIdIndex: number;
    selectedNodes: string[];
}