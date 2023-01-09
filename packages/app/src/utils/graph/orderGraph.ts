
export default function orderGraph(n: number, Adj: number[][]) {
    
    const pre = new Array(n).fill(0);
    const post = new Array(n).fill(0);
    const visited = new Array(n).fill(false);
    const cycles: number[][] = [];

    const dfsStack: number[] = [];
    let counter = 1;
    for (let u0 = 0; u0 < n; u0++) {
        if (!visited[u0]) {
            dfsStack.push(u0);
        }

        while (dfsStack.length > 0) {
            const u = dfsStack.pop()!; // u hasn't been visited

            if (u >= 0) {
                dfsStack.push(-u-1); // closes scope
                visited[u] = true;
                pre[u] = counter; counter++;
    
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
                post[u_end] = counter; counter++;
            }
        }
    }
    
    const sorted = post.slice().sort((a, b) => b - a);
    const topOrder = sorted.map(x => post.indexOf(x));

    return {
        cycles,
        topOrder,
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