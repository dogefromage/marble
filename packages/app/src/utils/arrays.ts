
export function arrayRange(size: number, offset = 0) {
    const arr = new Array(size);
    for (let i = 0; i < size; i++) {
        arr[ i ] = i + offset;
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