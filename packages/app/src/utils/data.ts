import { Obj } from "../types";

export function arrayRange(size: number, offset = 0) {
    const arr = new Array(size);
    for (let i = 0; i < size; i++) {
        arr[i] = i + offset;
    }
    return arr;
}

export function findRight<T>(array: T[], predicate: (t: T) => boolean): T | undefined {
    for (let i = array.length - 1; i >= 0; i--) {
        if (predicate(array[i])) {
            return array[i];
        }
    }
}

export function arrayDifference<T extends any>(arr: T[], negative: T[]) {
    const neg = new Set(negative);
    return arr.filter(el => !neg.has(el));
}

export function objMap<X, Y>(obj: Record<string, X>, map: (x: X) => Y) {
    const entries = Object.entries(obj) as [string, X][];
    const mappedEntries = entries
        .map(([key, value]) => [key, map(value)] as [string, Y]);
    return Object.fromEntries(mappedEntries) as Record<string, Y>;
}