import { DependencyGraph } from "../../types";

function dfs(curr: string, dependencyGraph: DependencyGraph, visited: Set<string>, topoList: string[]): boolean {
    visited.add(curr);

    const node = dependencyGraph.nodes.get(curr);
    const order = dependencyGraph.order.get(curr);
    if (!node || order?.state !== 'met') {
        return false; // no topological sorting possible
    }

    for (const depKey of node.dependencies) {
        if (!visited.has(depKey)) {
            if (!dfs(depKey, dependencyGraph, visited, topoList)) {
                return false;
            }
        }
    }
    topoList.push(curr);
    return true; // success
}

export default function (root: string, dependencyGraph: DependencyGraph) {
    const topoList: string[] = [];
    const visited = new Set<string>();
    if (!dfs(root, dependencyGraph, visited, topoList)) {
        return;
    }
    return topoList;
}