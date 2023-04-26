

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

const objHashCache = new WeakMap<object, number>(); // makes objects garbage collectable
const otherHashCache = new Map<any, number>(); // for now dont care about memory
const randomBuffer = new Uint32Array(new Int32Array(1));
export function crudeHash(value: any) {
    const hashCache = typeof value === 'object' ? objHashCache : otherHashCache;
    const cached = hashCache.get(value);
    if (cached != null) {
        return cached;
    }
    const val = crypto.getRandomValues(randomBuffer)[0];
    hashCache.set(value, val);
    return val;
}