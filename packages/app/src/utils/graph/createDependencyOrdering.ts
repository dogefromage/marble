import { DependencyAdjacency, OrderedDependency } from "../../types";
import { ihash } from "../program/hashInt";

export default function(dependencyElements: DependencyAdjacency) {

    const order = new Map<string, OrderedDependency>();
    const visited = new Set<string>();

    function orderDfs(key: string): OrderedDependency {
        visited.add(key);

        const node = dependencyElements.get(key);
        if (node == null) {
            const od: OrderedDependency = { key, state: 'missing', hash: 0, version: 0 };
            order.set(key, od);
            return od;
        }
    
        let state: OrderedDependency['state'] = 'met';
        let hash = ihash(node.version);

        for (const depKey of node.dependencies) {
            let dep = order.get(depKey);
            if (dep == null) {
                if (visited.has(depKey)) {
                    state = 'cyclic';
                    break;
                }
                dep = orderDfs(depKey);
            }
            if (dep.state !== 'met') {
                state = 'unmet';
                break;
            }
            hash ^= ihash(dep.hash);
        }

        const od: OrderedDependency = { 
            key, state, 
            hash: state == 'met' ? hash : 0, 
            version: node.version,
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
