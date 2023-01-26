import { DependencyGraph, DependencyNodeKey } from "../../types";

export default function (root: DependencyNodeKey, dependencyGraph: DependencyGraph) {
    const topoList: DependencyNodeKey[] = [];
    const visited = new Set<DependencyNodeKey>();

    function dfs(curr: DependencyNodeKey, dependencyGraph: DependencyGraph): boolean {
        visited.add(curr);
    
        const node = dependencyGraph.nodes.get(curr);
        const order = dependencyGraph.order.get(curr);
        if (!node || order?.state !== 'met') {
            return false; // no topological sorting possible
        }
    
        for (const depKey of node.dependencies) {
            if (!visited.has(depKey)) {
                if (!dfs(depKey, dependencyGraph)) {
                    return false;
                }
            }
        }
        topoList.push(curr);
        return true; // success
    }

    if (!dfs(root, dependencyGraph)) {
        return;
    }
    return topoList;
}