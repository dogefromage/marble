import { DependencyGraph, DependencyNodeKey, DependencyGraphNode, OrderedDependencyNode } from "../../types";
import { ihash } from "../hashInt32";

export default function(dependencyElements: DependencyGraph['nodes']) {
    const order = new Map<DependencyNodeKey, OrderedDependencyNode>();
    const visited = new Set<string>();

    function orderDfs(key: DependencyNodeKey): OrderedDependencyNode {
        visited.add(key);

        // create empty "missing" node, s.t. the rest of the program still works as expected 
        const node = dependencyElements.get(key);
        if (node == null) {
            const od: OrderedDependencyNode = { 
                key, 
                state: 'missing', 
                hash: 0,
                version: 0,
                dependencies: [],
                dependants: [], 
            };
            order.set(key, od);
            return od;
        }
    
        let state: OrderedDependencyNode['state'] = 'met';
        let hash = ihash(node.version);

        for (const depKey of node.dependencies) {
            let dep = order.get(depKey);
            if (dep == null) {
                if (visited.has(depKey)) {
                    // dep is visited but orderNode not yet node set, this means 
                    // its call is still on the stack, i.e. in the active dfs tree and a cycle is present
                    state = 'cyclic';
                    break;
                }
                dep = orderDfs(depKey);
            }
            // dependant will be added once since edge only apprears once
            dep.dependants.push(key);
            if (dep.state !== 'met') {
                state = 'unmet';
            }
            // xor is commutative, order of dependencies doesn't matter
            hash ^= ihash(dep.hash);
        }

        const od: OrderedDependencyNode = {
            key, state, 
            hash: state == 'met' ? hash : 0, 
            version: node.version,
            dependants: [], // initialize as empty, dependants push their id
            dependencies: node.dependencies,
        };
        order.set(key, od);
        return od;
    }

    for (const key of dependencyElements.keys()) {
        if (!visited.has(key)) {
            orderDfs(key);
        }
    }

    return order;
}
