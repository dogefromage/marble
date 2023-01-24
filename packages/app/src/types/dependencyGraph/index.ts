
export enum DependencyNodeType {
    Layer = 'layer',
    Geometry = 'geometry',
    NodeTemplate = 'node-template',
    ProgramInclude = 'program-include',
}

export interface DependencyGraphNode {
    key: string;
    type: DependencyNodeType;
    version: number;
    dependencies: string[];
}

export interface OrderedDependencyNode {
    key: string;
    state: 'met' | 'unmet' | 'cyclic' | 'missing';
    version: number;
    hash: number;
    dependencies: string[];
    dependants: string[];
}

export type DependencyAdjacency = Map<string, DependencyGraphNode>;

export interface DependencyGraph {
    nodes: DependencyAdjacency;
    order: Map<string, OrderedDependencyNode>;
}

export interface IDependency {
    id: string;
    version: number;
}