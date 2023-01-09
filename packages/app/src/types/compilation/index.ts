import { GNodeS, GNodeT } from "../geometries";

// errors
export enum GeometryCompilerErrorTypes {
    CyclicGeometryReferences = 'cyclic-geometries',
    MissingDependency = 'missing-dep',
    MissingInclude = 'missing-inc',
    GeoOutputMissing = 'geo-output-missing',
    CyclicNodes = 'cyclic-nodes',
    
    InvalidGraph = 'invalid-graph',
}
interface ErrorInfoCyclicGeometryDeps {
    type: GeometryCompilerErrorTypes.CyclicGeometryReferences;
    geometryIds: string[];
}
interface ErrorInfoDepNotFound {
    type: GeometryCompilerErrorTypes.MissingDependency,
    geometryId: string;
    dependency: string;
}
interface ErrorInfoIncNotFound {
    type: GeometryCompilerErrorTypes.MissingInclude,
    geometryId: string;
    include: string;
}
interface ErrorInfoGeoOutputMissing {
    type: GeometryCompilerErrorTypes.GeoOutputMissing,
    geometryId: string;
}
interface ErrorInfoCyclicNodes {
    type: GeometryCompilerErrorTypes.CyclicNodes,
    geometryId: string;
    cyclicNodes: number[];
}

export type SceneCompilerErrorInfo =
    | ErrorInfoCyclicGeometryDeps
    | ErrorInfoDepNotFound
    | ErrorInfoIncNotFound
    | ErrorInfoGeoOutputMissing
    | ErrorInfoCyclicNodes

export interface GeometryNodeScope {
    node: GNodeS;
    template: GNodeT;
}