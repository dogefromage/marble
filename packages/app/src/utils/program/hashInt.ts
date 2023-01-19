

export function ihash(x: number) {
    // hash x
    x = Math.imul((x >> 16) ^ x, 0x45d9f3b);
    x = Math.imul((x >> 16) ^ x, 0x45d9f3b);
    x = (x >> 16) ^ x;
    return x;
}

function iadd(a: number, b: number) {
    return (a + b) | 0;
}

export function hashIntSequence(X: number[]) {
    let x = 0;
    for (const y of X) {
        x = ihash(iadd(x, y));
    }
    return x;
}