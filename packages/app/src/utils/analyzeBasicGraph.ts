import { arrayRange } from "./arrays";

interface GraphInfo {
    cycles: number[][];
    topologicalSorting: number[];
    components: number[];
}

export default function analyzeBasicGraph(n: number, Adj: number[][]): GraphInfo {

    const { post, cyclicVerts } = generatePrePostOrder(n, Adj);

    if (cyclicVerts.length > 0) {
        const cycles = findCycleTroughVertices(n, Adj, cyclicVerts);
        return {
            cycles,
            topologicalSorting: [],
            components: [],
        }
    }

    const topologicalSorting = post
        .map((p, index) => [ p, index ])    // create pair 
        .sort(([ p1 ], [ p2 ]) => p2 - p1)  // sort by postorder
        .map(([ p, index ]) => index);      // map to index

    const components = findComponents(n, Adj);
    
    return {
        cycles: [],
        topologicalSorting,
        components,
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

/**
 * use DFS to find connected components in graph
 */
function findComponents(n: number, Adj: number[][]) {
    const components = new Array<number>(n).fill(-1);
    const visited = new Array<boolean>(n).fill(false);

    function componentDFS(v: number, component: number): number {
        visited[v] = true;
        for (const u of Adj[v]) {
            if (visited[u]) {
                component = components[u];
            } else {
                component = componentDFS(u, component);
            }
        }
        components[v] = component;
        return component;
    }
    for (let i = 0; i < n; i++) {
        if (!visited[i]) {
            componentDFS(i, i);
        }
    }
    return components;
}

// export default function analyzeBasicGraph(n: number, Adj: number[][]) {
    
//     const pre = new Array(n).fill(0);
//     const post = new Array(n).fill(0);
//     const visited = new Array<boolean>(n).fill(false);
//     const cycles: number[][] = [];

//     const dfsStack: number[] = [];
//     let intervalCounter = 1;
//     for (let u0 = 0; u0 < n; u0++) {
//         if (!visited[u0]) {
//             dfsStack.push(u0);
//         }

//         while (dfsStack.length > 0) {
//             const u = dfsStack.pop()!; // u hasn't been visited
//             if (u >= 0) {
//                 dfsStack.push(-u-1); // closes scope
//                 visited[u] = true;
//                 pre[u] = intervalCounter; intervalCounter++;
    
//                 for (const v of Adj[u]) {
//                     if (visited[v]) {
//                         if (pre[v] > 0 && post[v] === 0) { // cycle found through v
//                             const cycle = traceCycle(dfsStack, v);
//                             cycles.push(cycle);
//                         }
//                     }
//                     else {
//                         dfsStack.push(v);
//                     }
//                 }
//             } else {
//                 let u_end = -u-1;
//                 post[u_end] = intervalCounter; intervalCounter++;
//             }
//         }
//     }
    
//     const sorted = post.slice().sort((a, b) => b - a);
//     const topOrder = sorted.map(x => post.indexOf(x));

//     const components = new Array(n).fill(-1);
//     visited.fill(false); // reset

//     let currendComponent = 0;
//     for (let v0 = 0; v0 < n; v0++) {
//         if (!visited[v0]) {
//             currendComponent = 1 + markComponent(n, v0, Adj, components, visited, currendComponent);
//         }
//     }

//     return {
//         cycles,
//         topOrder,
//         components,
//     }
// }

// function traceCycle(stack: number[], v: number) {
//     // follow stack downwards
//     const cycle = [];
//     for (let i = stack.length - 1; i >= 0; i--) {
//         if (stack[i] < 0) {
//             const w = -stack[i]-1;
//             cycle.push(w);
//             if (w === v) {
//                 break;
//             }
//         }
//     }
//     return cycle;
// }

// function markComponent(n: number, v: number, Adj: number[][], components: number[], visited: boolean[], currentComponent: number): number {
//     visited[v] = true;
//     for (const u of Adj[v]) {
//         if (visited[u]) {
//             currentComponent = components[u];
//         } else {
//             currentComponent = markComponent(n, u, Adj, components, visited, currentComponent);
//         }
//     }
//     components[v] = currentComponent;
//     return currentComponent;
// }