
interface TopSortResult {
    cycles: number[][];
    topologicalSorting: number[];
}

export function sortTopologically(n: number, Adj: number[][]): TopSortResult {

    const { post, cyclicVerts } = generatePrePostOrder(n, Adj);

    if (cyclicVerts.length > 0) {
        const cycles = findCycleTroughVertices(n, Adj, cyclicVerts);
        return {
            cycles,
            topologicalSorting: [],
        }
    }

    const topologicalSorting = post
        .map((p, index) => [ p, index ])    // create pair 
        .sort(([ p1 ], [ p2 ]) => p2 - p1)  // sort by postorder
        .map(([ p, index ]) => index);      // map to index

    return {
        cycles: [],
        topologicalSorting: topologicalSorting,
    };
}

/**
 * perform DFS to find pre, postorder and cyclic verts
 */
function generatePrePostOrder(n: number, Adj: number[][]) {
    const visited = new Array<boolean>(n).fill(false);
    const pre = new Array<number>(n).fill(0);
    const post = new Array<number>(n).fill(0);
    const cyclicVerts: number[] = []; 
    
    function orderDFS(u: number, counter: number): number {
        visited[u] = true;
        pre[u] = counter++;
        for (let v of Adj[u]) {
            if (!visited[v]) {
                counter = orderDFS(v, counter);
            }
            if (visited[v] && post[v] === 0) {
                // vert v is still on stack, therefore cycle
                cyclicVerts.push(v);
            }
        }
        post[u] = counter++;
        return counter;
    }

    let counter = 1;
    for (let i = 0; i < n; i++) {
        if (!visited[i]) {
            counter = orderDFS(i, counter);
        }
    }

    return { pre, post, cyclicVerts };
}

function findCycleTroughVertices(n: number, Adj: number[][], cyclicVerts: number[]) {
    const visited = new Array<boolean>(n).fill(false);
    const cycles: number[][] = [];
    const stack: number[] = [];

    function cycleDFS(u: number) {
        visited[u] = true;
        stack.push(u);
        for (let v of Adj[u]) {
            if (stack[0] === v) {
                // back to start of cycle
                cycles.push(stack.slice());
            }
            if (!visited[v]) {
                cycleDFS(v);
            }
        }
        stack.pop();
    }

    for (let i = 0; i < cyclicVerts.length; i++) {
        const v = cyclicVerts[i];
        if (!visited[v]) {
            cycleDFS(v);
        }
    }
    return cycles;
}

export function findDependencies(n: number, Adj: number[][], targetIndex: number) {
    const visited = new Array<boolean>(n).fill(false);
    const isDependant = new Array<boolean>(n).fill(false);
    // base case
    isDependant[targetIndex] = true;
    // dfs
    function markDependants(v: number) {
        visited[v] = true;
        for (const u of Adj[v]) {
            if (!visited[u]) {
                markDependants(u);
            }
            isDependant[v] ||= isDependant[u];
        }
    }
    // initial calls
    for (let i = 0; i < n; i++) {
        if (!visited[i]) {
            markDependants(i);
        }
    }

    const visitedIndices = visited.reduce((indices, visited, index) => {
        if (visited) {
            indices.add(index);
        }
        return indices;
    }, new Set<number>());

    return visitedIndices;
}