import { splitFirst } from "../../utils/codeStrings";

export type DependencyNodeType = 'layer' | 'geometry' | 'node_template';

export function getDependencyKey(id: string, type: DependencyNodeType) {
    return `${type}:${id}` as const;
}
export type DependencyNodeKey = ReturnType<typeof getDependencyKey>;

export function splitDependencyKey(key: DependencyNodeKey) {
    const [ type, id ] = splitFirst(key, ':') as [ DependencyNodeType, string ];
    return { type, id }
}

export interface DependencyGraphNode {
    key: DependencyNodeKey;
    version: number;
    dependencies: DependencyNodeKey[];
}

export interface OrderedDependencyNode {
    key: DependencyNodeKey;
    state: 'met' | 'unmet' | 'cyclic' | 'missing';
    version: number;
    hash: number;
    dependencies: string[];
    dependants: string[];
}

export interface DependencyGraph {
    nodes: Map<DependencyNodeKey, DependencyGraphNode>;
    order: Map<DependencyNodeKey, OrderedDependencyNode>;
}

export interface Dependable {
    id: string;
    version: number;
}