
export default function orderGraph(n: number, Adj: number[][]) {
    
    const pre = new Array(n).fill(0);
    const post = new Array(n).fill(0);
    const visited = new Array<boolean>(n).fill(false);
    const cycles: number[][] = [];

    const dfsStack: number[] = [];
    let intervalCounter = 1;
    for (let u0 = 0; u0 < n; u0++) {
        if (!visited[u0]) {
            dfsStack.push(u0);
        }

        while (dfsStack.length > 0) {
            const u = dfsStack.pop()!; // u hasn't been visited
            if (u >= 0) {
                dfsStack.push(-u-1); // closes scope
                visited[u] = true;
                pre[u] = intervalCounter; intervalCounter++;
    
                for (const v of Adj[u]) {
                    if (visited[v]) {
                        if (pre[v] > 0 && post[v] === 0) { // cycle found through v
                            const cycle = traceCycle(dfsStack, v);
                            cycles.push(cycle);
                        }
                    }
                    else {
                        dfsStack.push(v);
                    }
                }
            } else {
                let u_end = -u-1;
                post[u_end] = intervalCounter; intervalCounter++;
            }
        }
    }
    
    const sorted = post.slice().sort((a, b) => b - a);
    const topOrder = sorted.map(x => post.indexOf(x));

    const components = new Array(n).fill(-1);
    visited.fill(false); // reset

    let currendComponent = 0;
    for (let v0 = 0; v0 < n; v0++) {
        if (!visited[v0]) {
            currendComponent = 1 + markComponent(n, v0, Adj, components, visited, currendComponent);
        }
    }

    return {
        cycles,
        topOrder,
        components,
    }
}

function traceCycle(stack: number[], v: number) {
    // follow stack downwards
    const cycle = [];
    for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i] < 0) {
            const w = -stack[i]-1;
            cycle.push(w);
            if (w === v) {
                break;
            }
        }
    }
    return cycle;
}

function markComponent(n: number, v: number, Adj: number[][], components: number[], visited: boolean[], currentComponent: number): number {
    visited[v] = true;
    for (const u of Adj[v]) {
        if (visited[u]) {
            currentComponent = components[u];
        } else {
            currentComponent = markComponent(n, u, Adj, components, visited, currentComponent);
        }
    }
    components[v] = currentComponent;
    return currentComponent;
}