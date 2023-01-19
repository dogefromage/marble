
export enum DependencyNodeType {
    Layer = 'layer',
    Geometry = 'geometry',
    NodeTemplate = 'node-template',
    ProgramInclude = 'program-include',
}

export interface DependencyNode {
    key: string;
    type: DependencyNodeType;
    version: number;
    dependencies: string[];
}

export interface OrderedDependency {
    key: string;
    state: 'met' | 'unmet' | 'cyclic' | 'missing';
    version: number;
    hash: number;
}

export type DependencyAdjacency = Map<string, DependencyNode>;

export interface DependencyGraph {
    nodes: DependencyAdjacency;
    order: Map<string, OrderedDependency>;
}

export interface IDependency {
    id: string;
    version: number;
}