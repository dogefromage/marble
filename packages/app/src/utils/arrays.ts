
export function arrayRange(size: number, offset = 0) {
    const arr = new Array(size);
    for (let i = 0; i < size; i++) {
        arr[ i ] = i + offset;
    }
    return arr;
}